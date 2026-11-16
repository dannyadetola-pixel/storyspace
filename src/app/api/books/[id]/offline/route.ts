import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Everything needed to read a book offline. Each chapter's text is included only
// when this reader may read it: free chapters, chapters they've unlocked, and
// chapters they wrote. Anything else is sent as locked, with no text at all.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      genre: true,
      status: true,
      isMature: true,
      tags: true,
      coverUrl: true,
      userId: true,
      user: { select: { username: true, isVerified: true } },
      chapters: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          body: true,
          order: true,
          priceKobo: true,
          wordCount: true,
        },
      },
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const isAuthor = userId !== null && userId === book.userId;

  const unlockedIds = new Set<string>();
  if (userId && !isAuthor) {
    const rows = await prisma.chapterUnlock.findMany({
      where: { userId, status: "SUCCESSFUL", chapter: { bookId: id } },
      select: { chapterId: true },
    });
    for (const r of rows) unlockedIds.add(r.chapterId);
  }

  const chapters = book.chapters.map((c) => {
    const canRead = isAuthor || c.priceKobo === 0 || unlockedIds.has(c.id);
    return {
      id: c.id,
      title: c.title,
      order: c.order,
      priceKobo: c.priceKobo,
      wordCount: c.wordCount,
      body: canRead ? c.body : null,
      locked: !canRead,
    };
  });

  return NextResponse.json(
    {
      id: book.id,
      title: book.title,
      description: book.description,
      genre: book.genre,
      status: book.status,
      isMature: book.isMature,
      tags: book.tags,
      coverUrl: book.coverUrl,
      user: book.user,
      chapters,
      savedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
