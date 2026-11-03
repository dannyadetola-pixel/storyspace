import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toProxyUrl } from "@/lib/media";
import UserLink from "@/components/UserLink";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true, isVerified: true } },
      _count: { select: { chapters: { where: { isPublished: true } } } },
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
          {books.map((book) => {
            const cover = toProxyUrl(book.coverUrl);
            return (
              <div
                key={book.id}
                className="flex gap-4 bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4"
              >
                <Link
                  href={`/books/${book.id}`}
                  className="w-16 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-app-text/40 dark:text-app-text-dark/40">
                      No cover
                    </span>
                  )}
                </Link>
                <div className="min-w-0 space-y-1">
                  <h2 className="font-medium text-app-text dark:text-app-text-dark">
                    <Link
                      href={`/books/${book.id}`}
                      className="hover:underline underline-offset-2"
                    >
                      {book.title}
                    </Link>
                    {book.isMature && (
                      <span className="ml-2 align-middle rounded-full border border-black/20 dark:border-white/25 px-1.5 text-[10px]">
                        18+
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                    <UserLink
                      username={book.user.username}
                      isVerified={book.user.isVerified}
                    />
                    {book.genre && ` · ${book.genre}`} · {book._count.chapters}{" "}
                    chapter{book._count.chapters === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}