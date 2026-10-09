import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageButton from "@/components/MessageButton";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      bio: true,
      isVerified: true,
      books: {
        select: { id: true, title: true, genre: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

  const isOwnProfile = session?.user?.username === user.username;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-sm mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            {user.username}
            {user.isVerified && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block w-4 h-4 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
              />
            )}
          </h1>
          {session?.user && !isOwnProfile && (
            <MessageButton username={user.username} />
          )}
        </div>
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          {user.bio || "No bio yet"}
        </p>

        {user.books.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-app-secondary dark:text-app-secondary-dark">
              Books
            </h2>
            {user.books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="block bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 hover:opacity-90"
              >
                <span className="text-app-text dark:text-app-text-dark">
                  {book.title}
                </span>
                {book.genre && (
                  <span className="text-app-text/60 dark:text-app-text-dark/60">
                    {" "}
                    · {book.genre}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
