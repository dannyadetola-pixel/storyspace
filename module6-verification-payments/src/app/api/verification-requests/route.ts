import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { reason } = await req.json();

  try {
    // upsert, not create — the schema allows exactly one request per user
    // ever, so a previously-rejected user needs this to be able to
    // resubmit rather than hitting a unique-constraint error forever.
    const request = await prisma.verificationRequest.upsert({
      where: { userId: session.user.id },
      update: {
        reason: reason || null,
        status: "PENDING",
        reviewedAt: null,
        submittedAt: new Date(),
      },
      create: { userId: session.user.id, reason: reason || null },
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
