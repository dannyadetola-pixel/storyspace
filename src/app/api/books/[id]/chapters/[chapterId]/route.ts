import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateChapterPrice, countWords } from "@/lib/pricing";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: bookId, chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: { book: { select: { userId: true } } },
  });
  if (!chapter || chapter.bookId !== bookId) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
  if (chapter.book.userId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can edit this chapter" }, { status: 403 });
  }

  const body = await req.json();
  const data: {
    title?: string;
    body?: string;
    wordCount?: number;
    priceKobo?: number;
    isPublished?: boolean;
    publishedAt?: Date;
  } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Chapter title is required" }, { status: 400 });
    }
    data.title = title.slice(0, 150);
  }

  if (typeof body.body === "string") {
    data.body = body.body;
    const wordCount = countWords(body.body);
    data.wordCount = wordCount;
    data.priceKobo = calculateChapterPrice(wordCount);
  }

  // Work out whether the chapter will be published after this save,
  // then refuse if it would be published with no text.
  const willBePublished =
    typeof body.publish === "boolean" ? body.publish : chapter.isPublished;
  const finalText = typeof body.body === "string" ? body.body : chapter.body;
  if (willBePublished && !finalText.trim()) {
    return NextResponse.json({ error: "Write some text before publishing" }, { status: 400 });
  }

  if (typeof body.publish === "boolean") {
    if (body.publish && !chapter.isPublished) {
      data.publishedAt = new Date();
    }
    data.isPublished = body.publish;
  }

  const updated = await prisma.chapter.update({ where: { id: chapterId }, data });
  return NextResponse.json(updated);
}