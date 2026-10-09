import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { name, usernames } = await req.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 }
    );
  }
  if (!Array.isArray(usernames) || usernames.length === 0) {
    return NextResponse.json(
      { error: "Add at least one other member" },
      { status: 400 }
    );
  }

  try {
    const members = await prisma.user.findMany({
      where: { username: { in: usernames } },
      select: { id: true, username: true },
    });

    // Don't count yourself as "another member" if you typed your own name.
    const others = members.filter((m) => m.id !== session.user.id);
    if (others.length === 0) {
      return NextResponse.json(
        { error: "None of those usernames were found" },
        { status: 400 }
      );
    }

    const foundNames = new Set(members.map((m) => m.username));
    const notFound = usernames.filter((u: string) => !foundNames.has(u));

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: true,
        name: name.trim(),
        participants: {
          create: [
            { userId: session.user.id, isAdmin: true },
            ...others.map((m) => ({ userId: m.id })),
          ],
        },
      },
    });

    return NextResponse.json({ id: conversation.id, notFound });
  } catch (err) {
    console.error("Creating group failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
