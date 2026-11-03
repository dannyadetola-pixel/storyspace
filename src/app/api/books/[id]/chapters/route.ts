import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateChapterPrice, countWords } from "@/lib/pricing";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: bookId } = await params;
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { userId: true },
  });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.userId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can add chapters" }, { status: 403 });
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.body === "string" ? body.body : "";
  const publish = body.publish === true;

  if (!title) {
    return NextResponse.json({ error: "Chapter title is required" }, { status: 400 });
  }
  if (publish && !text.trim()) {
    return NextResponse.json({ error: "Write some text before publishing" }, { status: 400 });
  }

  const wordCount = countWords(text);
  const priceKobo = calculateChapterPrice(wordCount);

  const lastChapter = await prisma.chapter.findFirst({
    where: { bookId },
    orderBy: { order: "desc" },
  });
  const order = (lastChapter?.order ?? 0) + 1;

  const chapter = await prisma.chapter.create({
    data: {
      bookId,
      title: title.slice(0, 150),
      body: text,
      wordCount,
      priceKobo,
      order,
      isPublished: publish,
      publishedAt: new Date(),
    },
  });

  return NextResponse.json(chapter);
}