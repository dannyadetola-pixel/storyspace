import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if ((targetType !== "POST" && targetType !== "CHAPTER") || !targetId) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { username: true, isVerified: true } } },
    });
    return NextResponse.json(comments);
  } catch (err) {
    console.error("Fetching comments failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { targetType, targetId, body } = await req.json();
  if (
    (targetType !== "POST" && targetType !== "CHAPTER") ||
    typeof targetId !== "string" ||
    typeof body !== "string" ||
    !body.trim()
  ) {
    return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        targetType,
        targetId,
        body: body.trim(),
      },
      include: { user: { select: { username: true, isVerified: true } } },
    });
    return NextResponse.json(comment);
  } catch (err) {
    console.error("Comment creation failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
