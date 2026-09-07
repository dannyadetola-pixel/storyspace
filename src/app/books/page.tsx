import Link from "next/link";
import { prisma } from "@/lib/prisma";

// See feed/page.tsx for why this line matters — same static-caching gap.
export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, isVerified: true } },
      _count: { select: { chapters: true } },
    },
  });

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Books
          </h1>
          <Link
            href="/books/new"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            Start a new book
          </Link>
        </div>

        {books.length === 0 && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            No books yet — be the first.
          </p>
        )}

        <div className="space-y-3">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="block bg-app-surface dark:bg-app-surface-dark rounded-2xl p-4 hover:opacity-90"
            >
              <h2 className="font-medium text-app-text dark:text-app-text-dark">
                {book.title}
              </h2>
              <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                {book.user.username}
                {book.user.isVerified && (
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                  />
                )}
                {book.genre && ` · ${book.genre}`} · {book._count.chapters}{" "}
                chapter{book._count.chapters === 1 ? "" : "s"}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
