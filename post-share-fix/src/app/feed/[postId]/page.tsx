import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ShareButton from "@/components/ShareButton";

export const dynamic = "force-dynamic";

function toProxyUrl(mediaUrl: string): string {
  const marker = "/storage/v1/object/public/";
  const index = mediaUrl.indexOf(marker);
  if (index === -1) return mediaUrl;
  return `/api/media/${mediaUrl.slice(index + marker.length)}`;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { user: { select: { username: true, isVerified: true } } },
  });

  if (!post) notFound();

  const [likeCount, myLike, commentCount] = await Promise.all([
    prisma.reaction.count({ where: { targetType: "POST", targetId: post.id } }),
    session?.user
      ? prisma.reaction.findUnique({
          where: {
            userId_targetType_targetId: {
              userId: session.user.id,
              targetType: "POST",
              targetId: post.id,
            },
          },
        })
      : null,
    prisma.comment.count({ where: { targetType: "POST", targetId: post.id } }),
  ]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-4">
        <Link
          href="/feed"
          className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
        >
          ← Feed
        </Link>

        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl overflow-hidden">
          {post.mediaType === "IMAGE" && (
            <div className="relative w-full aspect-square">
              <Image
                src={toProxyUrl(post.mediaUrl)}
                alt={post.caption ?? "Post image"}
                fill
                unoptimized
                loading="eager"
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
                  initialLiked={!!myLike}
                  initialCount={likeCount}
                />
              )}
              <CommentSection
                targetType="POST"
                targetId={post.id}
                initialCount={commentCount}
              />
              <ShareButton
                path={`/feed/${post.id}`}
                title={`${post.user.username} on StorySpace`}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
