import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Without this, Next.js can statically cache this page at build time —
// meaning it would show whatever posts existed the moment Vercel built it,
// never picking up new ones afterward.
export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, isVerified: true } } },
    take: 30,
  });

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Feed
          </h1>
          <Link
            href="/feed/new"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            New post
          </Link>
        </div>

        {posts.length === 0 && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            No posts yet — be the first.
          </p>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-app-surface dark:bg-app-surface-dark rounded-2xl overflow-hidden"
            >
              {post.mediaType === "IMAGE" && (
                <div className="relative w-full aspect-square">
                  <Image
                    src={post.mediaUrl}
                    alt={post.caption ?? "Post image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-3 text-sm text-app-text dark:text-app-text-dark">
                <span className="font-medium">{post.user.username}</span>
                {post.user.isVerified && (
                  <span
                    aria-hidden="true"
                    className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                  />
                )}
                {post.caption && <> — {post.caption}</>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
