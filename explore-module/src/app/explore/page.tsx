import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const hasQuery = query.length > 0;

  const [books, users, posts] = hasQuery
    ? await Promise.all([
        prisma.book.findMany({
          where: { title: { contains: query, mode: "insensitive" } },
          include: { user: { select: { username: true, isVerified: true } } },
          take: 10,
        }),
        prisma.user.findMany({
          where: { username: { contains: query, mode: "insensitive" } },
          select: { id: true, username: true, isVerified: true, bio: true },
          take: 10,
        }),
        prisma.post.findMany({
          where: { caption: { contains: query, mode: "insensitive" } },
          include: { user: { select: { username: true, isVerified: true } } },
          take: 10,
        }),
      ])
    : [[], [], []];

  const noResults =
    hasQuery && books.length === 0 && users.length === 0 && posts.length === 0;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Explore
        </h1>

        {/* Plain GET form — submitting it just reloads this page with
            ?q=... in the URL, so the search itself needs no client JS. */}
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search books, people, posts…"
            className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
          <button
            type="submit"
            className="rounded-full bg-app-primary dark:bg-app-primary-dark text-white px-5 py-2 font-medium"
          >
            Search
          </button>
        </form>

        {!hasQuery && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            Search for a book title, a username, or a post caption.
          </p>
        )}

        {noResults && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}

        {books.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-app-secondary dark:text-app-secondary-dark">
              Books
            </h2>
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="block bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 hover:opacity-90"
              >
                <p className="font-medium text-app-text dark:text-app-text-dark">
                  {book.title}
                </p>
                <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
                  {book.user.username}
                  {book.user.isVerified && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block w-2.5 h-2.5 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                    />
                  )}
                </p>
              </Link>
            ))}
          </section>
        )}

        {users.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-app-primary dark:text-app-primary-dark">
              People
            </h2>
            {users.map((u) => (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="block bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 hover:opacity-90"
              >
                <p className="font-medium text-app-text dark:text-app-text-dark">
                  {u.username}
                  {u.isVerified && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                    />
                  )}
                </p>
                {u.bio && (
                  <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
                    {u.bio}
                  </p>
                )}
              </Link>
            ))}
          </section>
        )}

        {posts.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-app-secondary dark:text-app-secondary-dark">
              Posts
            </h2>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/feed/${post.id}`}
                className="block bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 hover:opacity-90"
              >
                <p className="text-sm text-app-text dark:text-app-text-dark">
                  <span className="font-medium">{post.user.username}</span>
                  {post.user.isVerified && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block w-2.5 h-2.5 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                    />
                  )}
                  {post.caption && <> — {post.caption}</>}
                </p>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
