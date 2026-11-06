import { prisma } from "@/lib/prisma";

export type NotificationKind =
  | "LIKE"
  | "COMMENT"
  | "FOLLOW"
  | "VERIFIED"
  | "VERIFICATION_REVOKED"
  | "PAYMENT_APPROVED"
  | "PAYMENT_REVOKED"
  | "MESSAGE";

// Creates a notification for one user. A failure is logged but never
// breaks the action that triggered it, and nobody is notified about
// their own actions.
export async function notify(params: {
  userId: string;
  actorId?: string;
  type: NotificationKind;
  message: string;
  link?: string | null;
}) {
  if (params.actorId && params.actorId === params.userId) return;
  try {
    await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        message: params.message,
        link: params.link ?? null,
      },
    });
  } catch (err) {
    console.error("Notification failed:", err);
  }
}

// Finds who owns a post or chapter, and where it lives, so likes and
// comments can notify the owner with a link straight to the content.
export async function getTargetOwner(
  targetType: "POST" | "CHAPTER",
  targetId: string
): Promise<{ ownerId: string; noun: string; link: string } | null> {
  if (targetType === "POST") {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });
    return post
      ? { ownerId: post.userId, noun: "post", link: `/feed/${targetId}` }
      : null;
  }

  const chapter = await prisma.chapter.findUnique({
    where: { id: targetId },
    select: { id: true, book: { select: { id: true, userId: true } } },
  });
  return chapter
    ? {
        ownerId: chapter.book.userId,
        noun: "chapter",
        link: `/books/${chapter.book.id}/chapters/${chapter.id}`,
      }
    : null;
}