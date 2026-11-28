import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import ContentModeration from "@/components/ContentModeration";

export const dynamic = "force-dynamic";

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  const { q } = await searchParams;
  const query = q?.trim().slice(0, 80) ?? "";

  const postWhere = query
    ? {
        OR: [
          { caption: { contains: query, mode: "insensitive" as const } },
          { user: { username: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const bookWhere = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" as const } },
          { user: { username: { contains: query, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const [posts, books] = await Promise.all([
    prisma.post.findMany({
      where: postWhere,
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        caption: true,
        createdAt: true,
        user: { select: { username: true } },
      },
    }),
    prisma.book.findMany({
      where: bookWhere,
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        createdAt: true,
        user: { select: { username: true } },
      },
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Content
          </h1>
          <Link
            href="/admin"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            Back to admin
          </Link>
        </div>

        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by title, caption or username"
            className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-app-primary dark:bg-app-primary-dark px-4 py-2 text-sm font-medium text-white"
          >
            Search
          </button>
        </form>

        <ContentModeration
          posts={posts.map((p) => ({
            id: p.id,
            caption: p.caption,
            username: p.user.username,
            createdAt: p.createdAt.toISOString(),
          }))}
          books={books.map((b) => ({
            id: b.id,
            title: b.title,
            username: b.user.username,
            createdAt: b.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  );
}