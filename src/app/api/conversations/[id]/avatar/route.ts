import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToSupabase } from "@/lib/storage";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    select: { isAdmin: true, conversation: { select: { isGroup: true } } },
  });

  if (!membership) {
    return NextResponse.json({ error: "You're not part of this conversation" }, { status: 403 });
  }
  if (!membership.conversation.isGroup) {
    return NextResponse.json({ error: "Only group chats have a photo" }, { status: 400 });
  }
  if (!membership.isAdmin) {
    return NextResponse.json({ error: "Only group admins can change the photo" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("avatar") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image is too large (max 2MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
    const path = `group-avatars/${id}/${Date.now()}-${safeName}`;
    const avatarUrl = await uploadImageToSupabase(path, buffer, file.type);

    await prisma.conversation.update({ where: { id }, data: { avatarUrl } });
    return NextResponse.json({ avatarUrl });
  } catch (err) {
    console.error("Group photo upload failed:", err);
    return NextResponse.json({ error: "Couldn't upload that photo" }, { status: 500 });
  }
}
