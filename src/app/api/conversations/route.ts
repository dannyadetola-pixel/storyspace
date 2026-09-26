import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { username } = await req.json();
  if (typeof username !== "string" || !username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { username } });
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (targetUser.id === session.user.id) {
    return NextResponse.json(
      { error: "You can't message yourself" },
      { status: 400 }
    );
  }

  try {
    // Look for an existing 1:1 (non-group) conversation between exactly
    // these two people before creating a new one.
    let conversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId: session.user.id } } },
          { participants: { some: { userId: targetUser.id } } },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [{ userId: session.user.id }, { userId: targetUser.id }],
          },
        },
      });
    }

    return NextResponse.json({ id: conversation.id });
  } catch (err) {
    console.error("Starting conversation failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
