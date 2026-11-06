import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

async function isParticipant(conversationId: string, userId: string) {
  const row = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  return row !== null;
}

// Polling endpoint. One query: messages are returned only when the viewer
// is a participant. Anyone else gets an empty list, which reveals nothing.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const after = new URL(req.url).searchParams.get("after");
  const afterDate = after ? new Date(after) : null;
  const createdAfter =
    afterDate && !Number.isNaN(afterDate.getTime()) ? afterDate : null;

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
      conversation: {
        participants: { some: { userId: session.user.id } },
      },
      ...(createdAfter ? { createdAt: { gte: createdAfter } } : {}),
    },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: { id: true, body: true, senderId: true, createdAt: true },
  });

  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  if (!(await isParticipant(conversationId, session.user.id))) {
    return NextResponse.json(
      { error: "You're not part of this conversation" },
      { status: 403 }
    );
  }

  const { body } = await req.json();
  if (typeof body !== "string" || !body.trim()) {
    return NextResponse.json(
      { error: "Message can't be empty" },
      { status: 400 }
    );
  }

  try {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        body: body.trim(),
      },
    });

    // Tell everyone else in the conversation. Each notification is created
    // without blocking the message, and a failure never affects the sender.
    const others = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: session.user.id } },
      select: { userId: true },
    });
    const sender = session.user.username ?? "Someone";
    await Promise.all(
      others.map((p) =>
        notify({
          userId: p.userId,
          actorId: session.user.id,
          type: "MESSAGE",
          message: `${sender} sent you a message`,
          link: `/chats/${conversationId}`,
        })
      )
    );

    return NextResponse.json(message);
  } catch (err) {
    console.error("Sending message failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}