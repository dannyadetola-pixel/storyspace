import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProxyUrl } from "@/lib/media";
import TipButton from "@/components/TipButton";
import UserLink from "@/components/UserLink";
import ViewTracker from "@/components/ViewTracker";

export const dynamic = "force-dynamic";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const book = await prisma.book.findUnique({
    where: { id },
    include: { user: { select: { username: true, isVerified: true } } },
  });
  if (!book) notFound();

  const isAuthor = session?.user?.id === book.userId;

  // Readers see published chapters only. The author also sees drafts.
  const chapters = await prisma.chapter.findMany({
    where: { bookId: id, ...(isAuthor ? {} : { isPublished: true }) },
    orderBy: { order: "asc" },
  });
  const publishedCount = chapters.filter((c) => c.isPublished).length;

  const cover = toProxyUrl(book.coverUrl);
  const statusLabel = book.status === "ONGOING" ? "Ongoing" : "Complete";

  return (
    <main className="min-h-screen px-4 py-10">
      <ViewTracker bookId={book.id} />

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Book card */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 flex gap-5">
          <div className="w-28 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={`Cover of ${book.title}`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-app-text/40 dark:text-app-text-dark/40">No cover</span>
            )}
          </div>
          <div className="min-w-0 space-y-2">
            <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
              {book.title}
            </h1>
            <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
              by{" "}
              <UserLink
                username={book.user.username}
                isVerified={book.user.isVerified}
              />
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-app-text/60 dark:text-app-text-dark/60">
              {book.genre && (
                <span className="rounded-full border border-black/10 dark:border-white/15 px-2.5 py-0.5">
                  {book.genre}
                </span>
              )}
              <span className="rounded-full border border-black/10 dark:border-white/15 px-2.5 py-0.5">
                {statusLabel}
              </span>
              {book.isMature && (
                <span className="rounded-full border border-black/30 dark:border-white/40 px-2.5 py-0.5">
                  18+ mature
                </span>
              )}
            </div>
            {book.description && (
              <p className="text-sm whitespace-pre-line text-app-text/80 dark:text-app-text-dark/80">
                {book.description}
              </p>
            )}
          </div>
        </div>

        {book.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {book.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-app-primary/10 dark:bg-app-primary-dark/15 px-3 py-1 text-xs text-app-primary dark:text-app-primary-dark"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {isAuthor ? (
            <>
              <Link
                href={`/books/${book.id}/edit`}
                className="rounded-full border border-black/10 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-app-text dark:text-app-text-dark"
              >
                Edit book
              </Link>
              <Link
                href={`/books/${book.id}/chapters/new`}
                className="rounded-full bg-app-primary dark:bg-app-primary-dark text-white px-4 py-1.5 text-sm font-medium"
              >
                New chapter
              </Link>
            </>
          ) : (
            <TipButton username={book.user.username} />
          )}
        </div>

        {/* Table of contents */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
              Table of contents
            </p>
            {isAuthor && (
              <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                {publishedCount} published · {chapters.length - publishedCount} drafts
              </p>
            )}
          </div>

          {chapters.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
              {isAuthor ? "No chapters yet. Start with a new chapter." : "No chapters published yet."}
            </p>
          )}

          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/books/${book.id}/chapters/${chapter.id}`}
              className="flex items-center justify-between rounded-xl border border-black/5 dark:border-white/10 p-3 hover:opacity-90"
            >
              <span className="text-sm text-app-text dark:text-app-text-dark">
                {chapter.order}. {chapter.title}
              </span>
              <span className="flex items-center gap-2 text-xs">
                {!chapter.isPublished && (
                  <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-app-text/60 dark:text-app-text-dark/60">
                    Draft
                  </span>
                )}
                <span className="text-app-secondary dark:text-app-secondary-dark">
                  {chapter.priceKobo === 0 ? "Free" : `₦${chapter.priceKobo / 100}`}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
