import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);

  const books = await prisma.book.findMany({
    where: { title: { contains: q, mode: "insensitive" } },
    select: {
      id: true,
      title: true,
      user: { select: { username: true } },
      editorPick: { select: { id: true } },
    },
    take: 10,
  });
  return NextResponse.json(books);
}
