import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { title, description, genre } = await req.json();
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const book = await prisma.book.create({
    data: {
      title,
      description: description || null,
      genre: genre || null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(book);
}
