import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProxyUrl } from "@/lib/media";
import { houseAds } from "@/lib/ads";
import MarketingHero from "@/components/MarketingHero";
import BookCard from "@/components/BookCard";
import ShelfRow from "@/components/ShelfRow";
import FeaturedBanner, { type FeaturedSlide } from "@/components/FeaturedBanner";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  return session?.user ? <HomeFeed /> : <MarketingHero />;
}

async function HomeFeed() {
  const bookSelect = {
    user: { select: { username: true, isVerified: true } },
    _count: {
      select: {
        chapters: { where: { isPublished: true } },
        views: true,
      },
    },
  } as const;

  const [popular, newest, editorPicks, chapters, posts] = await Promise.all([
    prisma.book.findMany({
      orderBy: { views: { _count: "desc" } },
      take: 14,
      include: bookSelect,
    }),
    prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      take: 14,
      include: bookSelect,
    }),
    prisma.editorPick.findMany({
      orderBy: { position: "asc" },
      take: 14,
      include: { book: { include: bookSelect } },
    }),
    prisma.chapter.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 14,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            user: { select: { username: true, isVerified: true } },
          },
        },
      },
    }),
    prisma.post.findMany({
      where: { mediaType: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: 14,
      select: { id: true, mediaUrl: true, caption: true },
    }),
  ]);

  // Banner order: one book, a house ad, two books, a house ad. The ads sit in
  // the strip, never between the rows, so they never break a row.
  const bookSlide = (book: (typeof popular)[number]): FeaturedSlide => ({
    id: book.id,
    title: book.title,
    byline: book.user.username,
    isVerified: book.user.isVerified,
    description: book.description,
    coverUrl: book.coverUrl,
  });
  const adSlide = (ad: (typeof houseAds)[number]): FeaturedSlide => ({
    id: ad.id,
    title: ad.title,
    byline: "StorySpace",
    description: ad.description,
    coverUrl: null,
    href: ad.href,
    sponsored: true,
  });

  const bannerSlides: FeaturedSlide[] = [
    ...popular.slice(0, 1).map(bookSlide),
    adSlide(houseAds[0]),
    ...popular.slice(1, 3).map(bookSlide),
    adSlide(houseAds[1]),
  ];

  return (
    <main className="w-full space-y-12 px-4 py-8 sm:px-6 lg:px-10">
      {bannerSlides.length > 0 && <FeaturedBanner slides={bannerSlides} />}

      {popular.length > 0 && (
        <ShelfRow kicker="Most read on StorySpace" title="Popular right now">
          {popular.map((book) => (
            <BookCard
              key={book.id}
              href={`/books/${book.id}`}
              title={book.title}
              coverUrl={book.coverUrl}
              byline={book.user.username}
              isVerified={book.user.isVerified}
              meta={book.genre ?? `${book._count.chapters} chapters`}
              reads={book._count.views}
            />
          ))}
        </ShelfRow>
      )}

      {editorPicks.length > 0 && (
        <ShelfRow kicker="Chosen by the StorySpace team" title="Top picks by editors">
          {editorPicks.map(({ book }) => (
            <BookCard
              key={book.id}
              href={`/books/${book.id}`}
              title={book.title}
              coverUrl={book.coverUrl}
              byline={book.user.username}
              isVerified={book.user.isVerified}
              meta={book.genre ?? `${book._count.chapters} chapters`}
              reads={book._count.views}
            />
          ))}
        </ShelfRow>
      )}

      {newest.length > 0 && (
        <ShelfRow kicker="Fresh on StorySpace" title="New books">
          {newest.map((book) => (
            <BookCard
              key={book.id}
              href={`/books/${book.id}`}
              title={book.title}
              coverUrl={book.coverUrl}
              byline={book.user.username}
              isVerified={book.user.isVerified}
              meta={book.genre ?? `${book._count.chapters} chapters`}
              reads={book._count.views}
            />
          ))}
        </ShelfRow>
      )}

      {chapters.length > 0 && (
        <ShelfRow kicker="Keep reading" title="New chapters">
          {chapters.map((chapter) => (
            <BookCard
              key={chapter.id}
              href={`/books/${chapter.book.id}/chapters/${chapter.id}`}
              title={chapter.title}
              coverUrl={chapter.book.coverUrl}
              byline={chapter.book.user.username}
              isVerified={chapter.book.user.isVerified}
              meta={chapter.book.title}
            />
          ))}
        </ShelfRow>
      )}

      {posts.length > 0 && (
        <ShelfRow kicker="Photos and reels" title="From the feed">
          {posts.map((post) => {
            const image = toProxyUrl(post.mediaUrl);
            return (
              <a
                key={post.id}
                href={`/feed/${post.id}`}
                className="block h-40 w-40 shrink-0 snap-start overflow-hidden rounded-md shadow-sm sm:h-48 sm:w-48"
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={post.caption ?? "Post image"}
                    className="h-full w-full object-cover"
                  />
                )}
              </a>
            );
          })}
        </ShelfRow>
      )}

      {popular.length === 0 &&
        newest.length === 0 &&
        chapters.length === 0 &&
        posts.length === 0 && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            Nothing here yet. Be the first to publish a book or post.
          </p>
        )}
    </main>
  );
}