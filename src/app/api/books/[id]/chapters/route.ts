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

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the author can add chapters to this book" },
      { status: 403 }
    );
  }

  const { title, body } = await req.json();
  if (!title || !body) {
    return NextResponse.json(
      { error: "Title and chapter text are required" },
      { status: 400 }
    );
  }

  const wordCount = countWords(body);
  const priceKobo = calculateChapterPrice(wordCount);

  const lastChapter = await prisma.chapter.findFirst({
    where: { bookId },
    orderBy: { order: "desc" },
  });
  const order = (lastChapter?.order ?? 0) + 1;

  const chapter = await prisma.chapter.create({
    data: { bookId, title, body, wordCount, priceKobo, order },
  });

  return NextResponse.json(chapter);
}
