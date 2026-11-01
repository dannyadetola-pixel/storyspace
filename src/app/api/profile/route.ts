import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Updates the signed-in user's display name and bio. Username is not
// editable here, since it appears in profile links across the app.
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { name, bio } = await req.json();
  const data: { name?: string | null; bio?: string | null } = {};

  if (typeof name === "string") {
    data.name = name.trim().slice(0, 60) || null;
  }
  if (typeof bio === "string") {
    data.bio = bio.trim().slice(0, 300) || null;
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: { name: true, bio: true },
  });

  return NextResponse.json(user);
}