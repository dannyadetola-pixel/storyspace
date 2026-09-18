import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";

// Without this, Next.js can statically cache this page at build time —
// meaning it would show whatever posts existed the moment Vercel built it,
// never picking up new ones afterward.
export const dynamic = "force-dynamic";

// Converts a stored Supabase public URL into our own same-origin proxy
// path — see api/media/[...path]/route.ts for why this exists.
function toProxyUrl(mediaUrl: string): string {
  const marker = "/storage/v1/object/public/";
  const index = mediaUrl.indexOf(marker);
  if (index === -1) return mediaUrl;
  return `/api/media/${mediaUrl.slice(index + marker.length)}`;
}

export default async function FeedPage() {
  const session = await auth();

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true, isVerified: true } } },
    take: 30,
  });

  // One extra query instead of one-per-post (which would be 30 queries for
  // a full page) — fetch every reaction on these posts at once, then build
  // lookup maps for "how many" and "did the current user already like it".
  // Wrapped separately from the posts query above: if this one fails, the
  // feed should still show posts (just without like counts) rather than
  // the whole page going down over something non-essential.
  const countByPost = new Map<string, number>();
  const likedByMe = new Set<string>();
  try {
    const reactions = await prisma.reaction.findMany({
      where: { targetType: "POST", targetId: { in: posts.map((p) => p.id) } },
      select: { targetId: true, userId: true },
    });
    for (const r of reactions) {
      countByPost.set(r.targetId, (countByPost.get(r.targetId) ?? 0) + 1);
      if (r.userId === session?.user?.id) likedByMe.add(r.targetId);
    }
  } catch (err) {
    console.error("Failed to load reactions (feed still renders):", err);
  }

  const commentCountByPost = new Map<string, number>();
  try {
    const comments = await prisma.comment.findMany({
      where: { targetType: "POST", targetId: { in: posts.map((p) => p.id) } },
      select: { targetId: true },
    });
    for (const c of comments) {
      commentCountByPost.set(
        c.targetId,
        (commentCountByPost.get(c.targetId) ?? 0) + 1
      );
    }
  } catch (err) {
    console.error("Failed to load comment counts (feed still renders):", err);
  }

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
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden"
            >
              {post.mediaType === "IMAGE" && (
                <div className="relative w-full aspect-square">
                  <Image
                    src={toProxyUrl(post.mediaUrl)}
                    alt={post.caption ?? "Post image"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-3 space-y-2">
                <div className="text-sm text-app-text dark:text-app-text-dark">
                  <span className="font-medium">{post.user.username}</span>
                  {post.user.isVerified && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                    />
                  )}
                  {post.caption && <> — {post.caption}</>}
                </div>
                <div className="flex items-start gap-5">
                  {session?.user && (
                    <LikeButton
                      targetType="POST"
                      targetId={post.id}
                      initialLiked={likedByMe.has(post.id)}
                      initialCount={countByPost.get(post.id) ?? 0}
                    />
                  )}
                  <CommentSection
                    targetType="POST"
                    targetId={post.id}
                    initialCount={commentCountByPost.get(post.id) ?? 0}
                  />
                  <ShareButton path="/feed" title={`${post.user.username} on StorySpace`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
