import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToSupabase } from "@/lib/storage";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB — comfortably under typical serverless body limits

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    // Video/reel upload goes through Mux instead — coming as a follow-up,
    // not handled by this route.
    return NextResponse.json(
      { error: "Only images are supported here right now" },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Image is too large (max 4MB)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `posts/${session.user.id}/${Date.now()}-${file.name}`;
  const mediaUrl = await uploadImageToSupabase(key, buffer, file.type);

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      caption: caption || null,
      mediaType: "IMAGE",
      mediaUrl,
    },
  });

  return NextResponse.json(post);
}
