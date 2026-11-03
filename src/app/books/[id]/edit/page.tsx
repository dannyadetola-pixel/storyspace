import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChapterForm from "@/components/ChapterForm";

export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: { userId: true, title: true },
  });
  if (!book) notFound();
  if (book.userId !== session.user.id) redirect(`/books/${id}`);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-xl mx-auto space-y-4">
        <Link
          href={`/books/${id}`}
          className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
        >
          ← {book.title}
        </Link>
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          New chapter
        </h1>
        <ChapterForm bookId={id} />
      </div>
    </main>
  );
}