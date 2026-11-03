import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notify, getTargetOwner } from "@/lib/notify";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { targetType, targetId } = await req.json();
  if (
    (targetType !== "POST" && targetType !== "CHAPTER") ||
    typeof targetId !== "string"
  ) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  try {
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: session.user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.reaction.create({
      data: { userId: session.user.id, targetType, targetId, type: "LIKE" },
    });

    const owner = await getTargetOwner(targetType, targetId);
    if (owner) {
      await notify({
        userId: owner.ownerId,
        actorId: session.user.id,
        type: "LIKE",
        message: `${session.user.username} liked your ${owner.noun}`,
        link: owner.link,
      });
    }

    return NextResponse.json({ liked: true });
  } catch (err) {
    console.error("Reaction toggle failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}