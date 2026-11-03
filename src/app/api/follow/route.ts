import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

// Toggles following a user. Returns the new state.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Log in to follow people" }, { status: 401 });
  }

  const { username } = await req.json();
  const target = await prisma.user.findUnique({
    where: { username: String(username ?? "") },
    select: { id: true },
  });
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followedId: {
        followerId: session.user.id,
        followedId: target.id,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: session.user.id, followedId: target.id },
  });

  await notify({
    userId: target.id,
    actorId: session.user.id,
    type: "FOLLOW",
    message: `${session.user.username} started following you`,
    link: `/u/${session.user.username}`,
  });

  return NextResponse.json({ following: true });
}