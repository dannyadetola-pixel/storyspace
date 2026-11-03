import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normaliseTags } from "@/lib/bookFields";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const book = await prisma.book.create({
    data: {
      userId: session.user.id,
      title: title.slice(0, 120),
      description:
        typeof body.description === "string" && body.description.trim()
          ? body.description.trim().slice(0, 1000)
          : null,
      genre:
        typeof body.genre === "string" && body.genre.trim()
          ? body.genre.trim().slice(0, 60)
          : null,
      status: body.status === "COMPLETE" ? "COMPLETE" : "ONGOING",
      isMature: body.isMature === true,
      tags: normaliseTags(body.tags),
    },
  });

  return NextResponse.json(book);
}