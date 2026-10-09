import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const { id: bookId, chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { id: true, title: true } } },
  });

  if (!chapter || chapter.bookId !== bookId) notFound();

  const [prevChapter, nextChapter] = await Promise.all([
    prisma.chapter.findFirst({ where: { bookId, order: chapter.order - 1 } }),
    prisma.chapter.findFirst({ where: { bookId, order: chapter.order + 1 } }),
  ]);

  return (
    <main className="min-h-screen px-4 py-10">
      <article className="max-w-xl mx-auto">
        <Link
          href={`/books/${bookId}`}
          className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
        >
          {chapter.book.title}
        </Link>
        <h1 className="mt-2 mb-6 text-2xl font-medium text-app-text dark:text-app-text-dark">
          {chapter.title}
        </h1>

        {/* Full text shown regardless of priceKobo — access control is Module 6,
            once Flutterwave payments exist. Showing it here isn't a paywall gap,
            it's ahead of the module that's supposed to add the gate. */}
        <div className="font-serif text-lg leading-relaxed text-app-text dark:text-app-text-dark whitespace-pre-wrap">
          {chapter.body}
        </div>

        <div className="mt-10 flex items-center justify-between text-sm">
          {prevChapter ? (
            <Link
              href={`/books/${bookId}/chapters/${prevChapter.id}`}
              className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/books/${bookId}/chapters/${nextChapter.id}`}
              className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
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
