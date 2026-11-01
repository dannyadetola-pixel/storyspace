import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToSupabase } from "@/lib/storage";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
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

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
  const path = `avatars/${session.user.id}/${Date.now()}-${safeName}`;

  try {
    const avatarUrl = await uploadImageToSupabase(path, buffer, file.type);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { avatarUrl },
    });
    return NextResponse.json({ avatarUrl });
  } catch (err) {
    console.error("Avatar upload failed:", err);
    return NextResponse.json({ error: "Couldn't upload that image" }, { status: 500 });
  }
}