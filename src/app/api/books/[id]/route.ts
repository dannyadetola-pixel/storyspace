import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normaliseTags } from "@/lib/bookFields";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const book = await prisma.book.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.userId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can edit this book" }, { status: 403 });
  }

  const body = await req.json();
  const data: {
    title?: string;
    description?: string | null;
    genre?: string | null;
    status?: "ONGOING" | "COMPLETE";
    isMature?: boolean;
    tags?: string[];
  } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Title can't be empty" }, { status: 400 });
    }
    data.title = title.slice(0, 120);
  }
  if (typeof body.description === "string") {
    data.description = body.description.trim().slice(0, 1000) || null;
  }
  if (typeof body.genre === "string") {
    data.genre = body.genre.trim().slice(0, 60) || null;
  }
  if (body.status === "ONGOING" || body.status === "COMPLETE") {
    data.status = body.status;
  }
  if (typeof body.isMature === "boolean") {
    data.isMature = body.isMature;
  }
  if (Array.isArray(body.tags)) {
    data.tags = normaliseTags(body.tags);
  }

  const updated = await prisma.book.update({ where: { id }, data });
  return NextResponse.json(updated);
}