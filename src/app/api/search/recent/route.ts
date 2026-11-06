import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_KEPT = 8;

// The signed-in reader's most recent searches, newest first.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const rows = await prisma.recentSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: MAX_KEPT,
    select: { query: true },
  });
  return NextResponse.json(rows.map((r) => r.query));
}

// Saves a search. Running the same search again moves it to the top.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = session.user.id;

  const { query } = await req.json();
  const cleaned = typeof query === "string" ? query.trim().slice(0, 80) : "";
  if (cleaned.length < 2) return NextResponse.json({ ok: true });

  await prisma.recentSearch.upsert({
    where: { userId_query: { userId, query: cleaned } },
    update: { createdAt: new Date() },
    create: { userId, query: cleaned },
  });

  // Trim the history so only the newest searches remain.
  const stale = await prisma.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: MAX_KEPT,
    select: { id: true },
  });
  if (stale.length > 0) {
    await prisma.recentSearch.deleteMany({
      where: { id: { in: stale.map((s) => s.id) } },
    });
  }

  return NextResponse.json({ ok: true });
}

// Clears the whole history.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  await prisma.recentSearch.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ ok: true });
}
