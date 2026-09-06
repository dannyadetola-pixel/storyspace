import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, isVerified: true } },
      chapters: { orderBy: { order: "asc" } },
    },
  });

  if (!book) notFound();

  const isAuthor = session?.user?.id === book.userId;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            {book.title}
          </h1>
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            {book.user.username}
            {book.user.isVerified && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
              />
            )}
            {book.genre && ` · ${book.genre}`} ·{" "}
            {book.status === "ONGOING" ? "Ongoing" : "Complete"}
          </p>
          {book.description && (
            <p className="mt-2 text-sm text-app-text/80 dark:text-app-text-dark/80">
              {book.description}
            </p>
          )}
        </div>

        {isAuthor && (
          <Link
            href={`/books/${book.id}/chapters/new`}
            className="inline-block text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            Write a new chapter
          </Link>
        )}

        <div className="space-y-2">
          {book.chapters.length === 0 && (
            <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
              No chapters published yet.
            </p>
          )}
          {book.chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/books/${book.id}/chapters/${chapter.id}`}
              className="flex items-center justify-between bg-app-surface dark:bg-app-surface-dark rounded-xl p-3 hover:opacity-90"
            >
              <span className="text-app-text dark:text-app-text-dark">
                {chapter.order}. {chapter.title}
              </span>
              <span className="text-xs text-app-secondary dark:text-app-secondary-dark">
                {chapter.priceKobo === 0
                  ? "Free"
                  : `₦${chapter.priceKobo / 100}`}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
