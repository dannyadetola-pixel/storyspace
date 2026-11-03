import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/ChapterForm";

export const dynamic = "force-dynamic";

export default async function EditChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapterId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: bookId, chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { userId: true, title: true } } },
  });
  if (!chapter || chapter.bookId !== bookId) notFound();
  if (chapter.book.userId !== session.user.id) redirect(`/books/${bookId}`);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto space-y-4">
        <Link
          href={`/books/${bookId}`}
          className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
        >
          ← {chapter.book.title}
        </Link>
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Edit chapter
        </h1>
        <ChapterForm
          bookId={bookId}
          chapter={{
            id: chapter.id,
            title: chapter.title,
            body: chapter.body,
            isPublished: chapter.isPublished,
          }}
        />
      </div>
    </main>
  );
}