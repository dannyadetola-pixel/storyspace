import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });
  if (!participant) {
    return NextResponse.json(
      { error: "You're not part of this conversation" },
      { status: 403 }
    );
  }

  const { body } = await req.json();
  if (typeof body !== "string" || !body.trim()) {
    return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        body: body.trim(),
      },
    });
    return NextResponse.json(message);
  } catch (err) {
    console.error("Sending message failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
