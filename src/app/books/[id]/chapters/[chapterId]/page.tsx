import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";
import UserLink from "@/components/UserLink";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id: bookId, chapterId } = await params;
  const session = await auth();

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          user: { select: { username: true, isVerified: true } },
        },
      },
    },
  });

  if (!chapter || chapter.bookId !== bookId) notFound();

  const [prevChapter, nextChapter, reactionCount, myReaction, commentCount] =
    await Promise.all([
      prisma.chapter.findFirst({ where: { bookId, order: chapter.order - 1 } }),
      prisma.chapter.findFirst({ where: { bookId, order: chapter.order + 1 } }),
      prisma.reaction.count({
        where: { targetType: "CHAPTER", targetId: chapter.id },
      }),
      session?.user
        ? prisma.reaction.findUnique({
            where: {
              userId_targetType_targetId: {
                userId: session.user.id,
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
              username={chapter.book.user.username}
              isVerified={chapter.book.user.isVerified}
            />
          </p>
        </div>

        {/* Reading card — serif text with generous line height */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="font-serif text-lg leading-relaxed text-app-text dark:text-app-text-dark whitespace-pre-wrap">
            {chapter.body}
          </div>
        </div>

        {/* Engagement card */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-start gap-5">
          {session?.user && (
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

        {/* Chapter navigation */}
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