import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIN_ACCOUNT_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CREATOR_TYPES = ["books", "photos", "videos", "other"];

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json();
  const fullName = String(body.fullName ?? "").trim();
  const creatorType = String(body.creatorType ?? "");
  const externalLink = String(body.externalLink ?? "").trim();
  const sampleLink = String(body.sampleLink ?? "").trim();
  const additionalInfo = String(body.additionalInfo ?? "").trim().slice(0, 500);

  // Required details
  if (fullName.length < 3 || fullName.length > 80) {
    return NextResponse.json(
      { error: "Enter your full legal name (3–80 characters)" },
      { status: 400 }
    );
  }
  if (!CREATOR_TYPES.includes(creatorType)) {
    return NextResponse.json(
      { error: "Choose what you create" },
      { status: 400 }
    );
  }
  if (!isHttpUrl(externalLink)) {
    return NextResponse.json(
      { error: "Add a link to an external profile, for example Wattpad or Instagram" },
      { status: 400 }
    );
  }
  if (!isHttpUrl(sampleLink)) {
    return NextResponse.json(
      { error: "Add a link to a sample of your work, or to a chapter on StorySpace" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        createdAt: true,
        _count: { select: { books: true, posts: true } },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Automatic checks — no question needed for these
    if (Date.now() - user.createdAt.getTime() < MIN_ACCOUNT_AGE_MS) {
      return NextResponse.json(
        {
          error:
            "Your account needs to be at least 7 days old before you can request verification",
        },
        { status: 400 }
      );
    }
    if (user._count.books + user._count.posts === 0) {
      return NextResponse.json(
        { error: "Publish a book or a post before requesting verification" },
        { status: 400 }
      );
    }

    const existing = await prisma.verificationRequest.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });
    if (existing?.status === "PENDING") {
      return NextResponse.json(
        { error: "Your verification request is already pending review" },
        { status: 409 }
      );
    }

    // upsert, so a rejected user can resubmit with updated details
    const request = await prisma.verificationRequest.upsert({
      where: { userId: session.user.id },
      update: {
        fullName,
        creatorType,
        externalLink,
        sampleLink,
        reason: additionalInfo || null,
        status: "PENDING",
        reviewedAt: null,
        submittedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        fullName,
        creatorType,
        externalLink,
        sampleLink,
        reason: additionalInfo || null,
      },
    });

    return NextResponse.json(request);
  } catch (err) {
    console.error("Verification request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}