import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

const MIN_REASON = 5;
const MAX_REASON = 300;

// Admin takedown. Removes a post or a book for everyone, and tells the author why.
//
// A book with paid chapters is refused (409) unless the request sends
// force: true. The admin should only send that after refunding those readers
// in Paystack, because the app does not reverse payments.
export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  const adminId = session?.user?.id ?? "";
  const adminName = session?.user?.username ?? "unknown";

  const { kind, id, reason, force } = await req.json();
  const cleanReason = typeof reason === "string" ? reason.trim() : "";

  if (typeof id !== "string" || (kind !== "post" && kind !== "book")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (cleanReason.length < MIN_REASON || cleanReason.length > MAX_REASON) {
    return NextResponse.json(
      { error: `Give a reason of ${MIN_REASON} to ${MAX_REASON} characters. The author will see it.` },
      { status: 400 }
    );
  }

  try {
    if (kind === "post") {
      const post = await prisma.post.findUnique({
        where: { id },
        select: { id: true, userId: true },
      });
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

      await prisma.reaction.deleteMany({ where: { targetType: "POST", targetId: id } });
      await prisma.comment.deleteMany({ where: { targetType: "POST", targetId: id } });
      await prisma.post.delete({ where: { id } });

      await notify({
        userId: post.userId,
        actorId: adminId,
        type: "CONTENT_REMOVED",
        message: `Your post was removed by StorySpace. Reason: ${cleanReason}`,
        link: null,
      });
    } else {
      const book = await prisma.book.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          userId: true,
          chapters: { select: { id: true } },
        },
      });
      if (!book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

      const chapterIds = book.chapters.map((c) => c.id);

      const paidCount = await prisma.chapterUnlock.count({
        where: { chapterId: { in: chapterIds }, status: "SUCCESSFUL" },
      });
      if (paidCount > 0 && force !== true) {
        return NextResponse.json(
          {
            error: `${paidCount} reader${paidCount === 1 ? " has" : "s have"} paid for chapters in this book. Refund ${paidCount === 1 ? "them" : "them all"} in Paystack first, then remove it again.`,
            paidCount,
          },
          { status: 409 }
        );
      }

      await prisma.reaction.deleteMany({
        where: { targetType: "CHAPTER", targetId: { in: chapterIds } },
      });
      await prisma.comment.deleteMany({
        where: { targetType: "CHAPTER", targetId: { in: chapterIds } },
      });
      // Deleting the book also removes its chapters, views, editor pick and unlocks.
      await prisma.book.delete({ where: { id } });

      await notify({
        userId: book.userId,
        actorId: adminId,
        type: "CONTENT_REMOVED",
        message: `Your book "${book.title}" was removed by StorySpace. Reason: ${cleanReason}`,
        link: null,
      });
    }

    console.log(
      `[admin/content] removed ${kind} ${id} by ${adminName} | reason: ${cleanReason}${force ? " | paid content forced" : ""}`
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/content] removal failed:", err);
    return NextResponse.json({ error: "Couldn't remove it" }, { status: 500 });
  }
}