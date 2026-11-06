import Link from "next/link";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProxyUrl } from "@/lib/media";
import VerifiedBadge from "@/components/VerifiedBadge";
import SaveSearch from "@/components/SaveSearch";
import RecentSearches from "@/components/RecentSearches";
import ExploreGrid, { type GridTile } from "@/components/ExploreGrid";

export const dynamic = "force-dynamic";

type Tab = "top" | "books" | "people" | "posts";

const TABS: { key: Tab; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "books", label: "Books" },
  { key: "people", label: "People" },
  { key: "posts", label: "Posts" },
];

// Compact counts: 950, 2K, 1.2K, 3.4M. Trailing ".0" is dropped.
function formatCount(n: number): string {
  const trim = (x: number) => x.toFixed(1).replace(/\.0$/, "");
  if (n >= 1_000_000) return `${trim(n / 1_000_000)}M`;
  if (n >= 1_000) return `${trim(n / 1_000)}K`;
  return `${n}`;
}

// Posts are ranked by likes, then by recency. Likes are stored polymorphically,
// so they're counted in one grouped query rather than through a relation.
async function rankedPosts(query: string, limit: number) {
  const candidates = await prisma.post.findMany({
    where: { caption: { contains: query, mode: "insensitive" } },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      caption: true,
      mediaUrl: true,
      mediaType: true,
      createdAt: true,
      user: { select: { username: true, isVerified: true } },
    },
  });
  if (candidates.length === 0) return [];

  const likes = new Map<string, number>();
  try {
    const grouped = await prisma.reaction.groupBy({
      by: ["targetId"],
      where: {
        targetType: "POST",
        targetId: { in: candidates.map((p) => p.id) },
      },
      _count: { _all: true },
    });
    for (const g of grouped) likes.set(g.targetId, g._count._all);
  } catch (err) {
    console.error("Ranking posts by likes failed:", err);
  }

  return candidates
    .map((p) => ({ ...p, likes: likes.get(p.id) ?? 0 }))
    .sort(
      (a, b) =>
        b.likes - a.likes || b.createdAt.getTime() - a.createdAt.getTime()
    )
    .slice(0, limit);
}

function SearchForm({ query, activeTab }: { query: string; activeTab: Tab }) {
  return (
    <form method="GET" className="flex gap-2">
      {activeTab !== "top" && (
        <input type="hidden" name="tab" value={activeTab} />
      )}
      <input
        type="text"
        name="q"
        defaultValue={query}
        placeholder="Search books, people, posts…"
        className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary"
      />
      <button
        type="submit"
        className="rounded-full bg-app-primary dark:bg-app-primary-dark px-5 py-2 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}

function ResultsSection({
  title,
  seeAllHref,
  children,
}: {
  title: string;
  seeAllHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-app-text dark:text-app-text-dark">
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm text-app-primary dark:text-app-primary-dark"
          >
            See all
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  const { q, tab } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  const query = q?.trim().slice(0, 80) ?? "";
  const hasQuery = query.length > 0;
  const activeTab: Tab = TABS.some((t) => t.key === tab)
    ? (tab as Tab)
    : "top";

  // ----- No search yet: recent searches and the mixed grid -----
  if (!hasQuery) {
    const [recentSearches, popularBooks, latestPosts] = await Promise.all([
      userId
        ? prisma.recentSearch.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 8,
            select: { query: true },
          })
        : Promise.resolve([] as { query: string }[]),
      prisma.book.findMany({
        orderBy: { views: { _count: "desc" } },
        take: 14,
        select: { id: true, title: true, coverUrl: true },
      }),
      prisma.post.findMany({
        where: { mediaType: "IMAGE" },
        orderBy: { createdAt: "desc" },
        take: 14,
        select: { id: true, mediaUrl: true, caption: true },
      }),
    ]);

    // Books and posts alternate, so neither dominates the grid.
    const tiles: GridTile[] = [];
    const longest = Math.max(popularBooks.length, latestPosts.length);
    for (let i = 0; i < longest; i++) {
      const post = latestPosts[i];
      if (post) {
        tiles.push({
          key: `post-${post.id}`,
          href: `/feed/${post.id}`,
          title: post.caption ?? "Photo",
          image: toProxyUrl(post.mediaUrl),
        });
      }
      const book = popularBooks[i];
      if (book) {
        tiles.push({
          key: `book-${book.id}`,
          href: `/books/${book.id}`,
          title: book.title,
          image: toProxyUrl(book.coverUrl),
        });
      }
    }

    return (
      <main className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="text-xl font-semibold text-app-text dark:text-app-text-dark">
          Explore
        </h1>
        <SearchForm query="" activeTab="top" />

        <RecentSearches items={recentSearches.map((r) => r.query)} />

        {tiles.length > 0 ? (
          <ExploreGrid tiles={tiles} />
        ) : (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            Nothing to explore yet. Publish a book or a post to get started.
          </p>
        )}
      </main>
    );
  }

  // ----- A search is running: tabs and ranked results -----
  const limit = activeTab === "top" ? 4 : 24;
  const showBooks = activeTab === "top" || activeTab === "books";
  const showPeople = activeTab === "top" || activeTab === "people";
  const showPosts = activeTab === "top" || activeTab === "posts";

  const [books, people, posts] = await Promise.all([
    prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { genre: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: [{ views: { _count: "desc" } }, { createdAt: "desc" }],
      take: showBooks ? limit : 0,
      include: {
        user: { select: { username: true, isVerified: true } },
        _count: {
          select: {
            views: true,
            chapters: { where: { isPublished: true } },
          },
        },
      },
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { followsReceived: { _count: "desc" } },
      take: showPeople ? limit : 0,
      select: {
        username: true,
        name: true,
        bio: true,
        avatarUrl: true,
        isVerified: true,
        _count: { select: { followsReceived: true } },
      },
    }),
    showPosts ? rankedPosts(query, limit) : [],
  ]);

  const noResults =
    books.length === 0 && people.length === 0 && posts.length === 0;

  function tabHref(t: Tab) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (t !== "top") params.set("tab", t);
    const qs = params.toString();
    return qs ? `/explore?${qs}` : "/explore";
  }

  return (
    <main className="w-full space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-xl font-semibold text-app-text dark:text-app-text-dark">
        Explore
      </h1>
      <SearchForm query={query} activeTab={activeTab} />
      {userId && <SaveSearch query={query} />}

      {/* Tabs. They scroll sideways on narrow screens. */}
      <nav className="flex gap-6 overflow-x-auto border-b border-black/10 dark:border-white/10">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={tabHref(t.key)}
            className={`-mb-px whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium ${
              activeTab === t.key
                ? "border-app-primary text-app-text dark:text-app-text-dark"
                : "border-transparent text-app-text/60 dark:text-app-text-dark/60"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {noResults && (
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          No results for &ldquo;{query}&rdquo;.
        </p>
      )}

      {books.length > 0 && (
        <ResultsSection
          title="Books"
          seeAllHref={activeTab === "top" ? tabHref("books") : undefined}
        >
          <div className="space-y-2">
            {books.map((book) => {
              const cover = toProxyUrl(book.coverUrl);
              return (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex gap-4 rounded-xl border border-black/5 dark:border-white/10 bg-app-surface dark:bg-app-surface-dark p-3 hover:opacity-90"
                >
                  <div className="w-14 aspect-[2/3] shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-app-primary to-app-secondary">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium text-app-text dark:text-app-text-dark">
                      {book.title}
                    </p>
                    <p className="flex items-center text-xs text-app-text/60 dark:text-app-text-dark/60">
                      {book.user.username}
                      {book.user.isVerified && <VerifiedBadge />}
                    </p>
                    <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                      {book.genre ?? "Book"} · {formatCount(book._count.views)} reads ·{" "}
                      {book._count.chapters} chapters
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </ResultsSection>
      )}

      {people.length > 0 && (
        <ResultsSection
          title="People"
          seeAllHref={activeTab === "top" ? tabHref("people") : undefined}
        >
          <div className="space-y-2">
            {people.map((u) => {
              const avatar = toProxyUrl(u.avatarUrl);
              return (
                <Link
                  key={u.username}
                  href={`/u/${u.username}`}
                  className="flex items-center gap-3 rounded-xl border border-black/5 dark:border-white/10 bg-app-surface dark:bg-app-surface-dark p-3 hover:opacity-90"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-app-primary text-sm font-medium text-white">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      u.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center truncate text-sm font-medium text-app-text dark:text-app-text-dark">
                      {u.name || u.username}
                      {u.isVerified && <VerifiedBadge />}
                    </p>
                    <p className="truncate text-xs text-app-text/60 dark:text-app-text-dark/60">
                      @{u.username}
                      {u.bio ? ` · ${u.bio}` : ""}
                    </p>
                    <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                      {formatCount(u._count.followsReceived)} followers
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </ResultsSection>
      )}

      {posts.length > 0 && (
        <ResultsSection
          title="Posts"
          seeAllHref={activeTab === "top" ? tabHref("posts") : undefined}
        >
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {posts.map((p) => {
              const image = p.mediaType === "IMAGE" ? toProxyUrl(p.mediaUrl) : null;
              return (
                <Link
                  key={p.id}
                  href={`/feed/${p.id}`}
                  className="group relative aspect-square overflow-hidden rounded-md bg-gradient-to-br from-app-primary to-app-secondary"
                >
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-white">
                      {p.caption ?? "Post"}
                    </span>
                  )}
                  <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white">
                    ♥ {p.likes}
                  </span>
                </Link>
              );
            })}
          </div>
        </ResultsSection>
      )}
    </main>
  );
}
