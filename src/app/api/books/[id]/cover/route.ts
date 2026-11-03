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
  const book = await prisma.book.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }
  if (book.userId !== session.user.id) {
    return NextResponse.json({ error: "Only the author can change the cover" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("cover") as File | null;
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
    const path = `covers/${id}/${Date.now()}-${safeName}`;
    const coverUrl = await uploadImageToSupabase(path, buffer, file.type);

    await prisma.book.update({ where: { id }, data: { coverUrl } });
    return NextResponse.json({ coverUrl });
  } catch (err) {
    console.error("Cover upload failed:", err);
    return NextResponse.json({ error: "Couldn't upload that image" }, { status: 500 });
  }
}