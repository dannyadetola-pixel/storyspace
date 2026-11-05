import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// List the picks in display order.
export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const picks = await prisma.editorPick.findMany({
    orderBy: { position: "asc" },
    include: {
      book: {
        select: { id: true, title: true, user: { select: { username: true } } },
      },
    },
  });
  return NextResponse.json(picks);
}

// Add a book to the end of the row.
export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { bookId } = await req.json();
  if (typeof bookId !== "string") {
    return NextResponse.json({ error: "Missing book" }, { status: 400 });
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true },
  });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const last = await prisma.editorPick.findFirst({
    orderBy: { position: "desc" },
    select: { position: true },
  });

  try {
    const pick = await prisma.editorPick.create({
      data: { bookId, position: (last?.position ?? 0) + 1 },
    });
    return NextResponse.json(pick);
  } catch {
    // The unique key on bookId means it's already in the row.
    return NextResponse.json(
      { error: "That book is already in the row" },
      { status: 409 }
    );
  }
}

// Remove a book from the row.
export async function DELETE(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { bookId } = await req.json();
  if (typeof bookId !== "string") {
    return NextResponse.json({ error: "Missing book" }, { status: 400 });
  }

  await prisma.editorPick.deleteMany({ where: { bookId } });
  return NextResponse.json({ ok: true });
}
