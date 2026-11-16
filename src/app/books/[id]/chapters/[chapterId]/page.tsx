import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import UserLink from "@/components/UserLink";
import UnlockChapterButton from "@/components/UnlockChapterButton";

export const dynamic = "force-dynamic";

// How many words a locked chapter shows before the reader pays.
const PREVIEW_WORDS = 120;

function naira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default async function ChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; chapterId: string }>;
  searchParams: Promise<{ unlock?: string }>;
}) {
  const { id: bookId, chapterId } = await params;
  const { unlock } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          userId: true,
          user: {
            select: {
              username: true,
              isVerified: true,
              isPaymentEligible: true,
              paystackSubaccountCode: true,
            },
          },
        },
      },
    },
  });

  if (!chapter || chapter.bookId !== bookId) notFound();

  const isAuthor = userId !== null && userId === chapter.book.userId;

  // Drafts are visible only to the author.
  if (!chapter.isPublished && !isAuthor) notFound();

  // Priced chapters need a successful unlock by this reader.
  const hasUnlock =
    userId && !isAuthor && chapter.priceKobo > 0
      ? await prisma.chapterUnlock.findFirst({
          where: { userId, chapterId, status: "SUCCESSFUL" },
          select: { id: true },
        })
      : null;

  const canRead = isAuthor || chapter.priceKobo === 0 || !!hasUnlock;

  // Readers move only between published chapters. The author also sees drafts.
  const visibility = isAuthor ? {} : { isPublished: true };

  const [prevChapter, nextChapter, reactionCount, myReaction, commentCount] =
    await Promise.all([
      prisma.chapter.findFirst({
        where: { bookId, order: chapter.order - 1, ...visibility },
      }),
      prisma.chapter.findFirst({
        where: { bookId, order: chapter.order + 1, ...visibility },
      }),
      prisma.reaction.count({
        where: { targetType: "CHAPTER", targetId: chapter.id },
      }),
      userId && canRead
        ? prisma.reaction.findUnique({
            where: {
              userId_targetType_targetId: {
                userId,
                targetType: "CHAPTER",
                targetId: chapter.id,
              },
            },
          })
        : null,
      prisma.comment.count({
        where: { targetType: "CHAPTER", targetId: chapter.id },
      }),
    ]);

  // Only the preview leaves the server for a locked chapter.
  const preview = canRead
    ? null
    : chapter.body.trim().split(/\s+/).slice(0, PREVIEW_WORDS).join(" ");

  const author = chapter.book.user;
  const canBuy = author.isPaymentEligible && !!author.paystackSubaccountCode;

  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-xl mx-auto space-y-4">
        <div className="space-y-1">
          <Link
            href={`/books/${bookId}`}
            className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
          >
            ← {chapter.book.title}
          </Link>
          <h1 className="text-2xl font-medium text-app-text dark:text-app-text-dark">
            {chapter.title}
          </h1>
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
            by{" "}
            <UserLink
              username={author.username}
              isVerified={author.isVerified}
            />
          </p>
        </div>

        {unlock === "paid" && (
          <p className="text-sm text-app-primary dark:text-app-primary-dark">
            Chapter unlocked. Thanks for supporting the author.
          </p>
        )}
        {unlock === "failed" && (
          <p className="text-sm text-red-600">
            The payment didn&rsquo;t complete. Nothing was charged for this chapter.
          </p>
        )}

        {isAuthor && !chapter.isPublished && (
          <div className="flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/15 p-4">
            <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
              Draft. Only you can see this chapter.
            </p>
            <Link
              href={`/books/${bookId}/chapters/${chapter.id}/edit`}
              className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              Edit and publish
            </Link>
          </div>
        )}

        {canRead ? (
          <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="font-serif text-lg leading-relaxed text-app-text dark:text-app-text-dark whitespace-pre-wrap">
              {chapter.body || "This chapter is empty."}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="font-serif text-lg leading-relaxed text-app-text dark:text-app-text-dark">
                {preview}…
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-black/5 bg-app-surface p-5 text-center dark:border-white/10 dark:bg-app-surface-dark">
              <p className="text-sm text-app-text dark:text-app-text-dark">
                Keep reading for {naira(chapter.priceKobo)}.
              </p>
              {!userId ? (
                <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                  <Link
                    href="/login"
                    className="text-app-primary underline underline-offset-2 dark:text-app-primary-dark"
                  >
                    Log in
                  </Link>{" "}
                  to unlock this chapter.
                </p>
              ) : !canBuy ? (
                <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                  The author isn&rsquo;t set up to receive payments yet, so this
                  chapter can&rsquo;t be unlocked yet.
                </p>
              ) : (
                <UnlockChapterButton
                  chapterId={chapter.id}
                  priceLabel={naira(chapter.priceKobo)}
                />
              )}
            </div>
          </div>
        )}

        {canRead && chapter.isPublished && (
          <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-start gap-5">
            {userId && (
              <LikeButton
                targetType="CHAPTER"
                targetId={chapter.id}
                initialLiked={!!myReaction}
                initialCount={reactionCount}
              />
            )}
            <CommentSection
              targetType="CHAPTER"
              targetId={chapter.id}
              initialCount={commentCount}
            />
            <ShareButton
              path={`/books/${bookId}/chapters/${chapter.id}`}
              title={`${chapter.book.title} — ${chapter.title}`}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {prevChapter ? (
            <Link
              href={`/books/${bookId}/chapters/${prevChapter.id}`}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 text-sm text-app-primary dark:text-app-primary-dark hover:opacity-90"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/books/${bookId}/chapters/${nextChapter.id}`}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 text-sm text-right text-app-primary dark:text-app-primary-dark hover:opacity-90"
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </article>
    </main>
  );
}
