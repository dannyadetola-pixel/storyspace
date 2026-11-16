import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Log in to unlock chapters" }, { status: 401 });
  }
  const userId = session.user.id;

  const { id } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    select: {
      id: true,
      priceKobo: true,
      isPublished: true,
      book: {
        select: {
          userId: true,
          user: { select: { isPaymentEligible: true, paystackSubaccountCode: true } },
        },
      },
    },
  });

  if (!chapter || !chapter.isPublished) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }
  if (chapter.priceKobo <= 0) {
    return NextResponse.json({ error: "This chapter is free" }, { status: 400 });
  }
  if (chapter.book.userId === userId) {
    return NextResponse.json({ error: "You can't unlock your own chapter" }, { status: 400 });
  }

  const author = chapter.book.user;
  if (!author.isPaymentEligible || !author.paystackSubaccountCode) {
    return NextResponse.json(
      { error: "The author isn't set up to receive payments yet" },
      { status: 400 }
    );
  }

  const existing = await prisma.chapterUnlock.findUnique({
    where: { userId_chapterId: { userId, chapterId: id } },
    select: { status: true },
  });
  if (existing?.status === "SUCCESSFUL") {
    return NextResponse.json({ error: "You've already unlocked this chapter" }, { status: 400 });
  }

  // A fresh reference for each attempt. A failed or abandoned attempt is simply
  // replaced; the webhook only records the reference that was actually paid.
  const reference = `unlock_${crypto.randomUUID()}`;
  await prisma.chapterUnlock.upsert({
    where: { userId_chapterId: { userId, chapterId: id } },
    update: { reference, amountKobo: chapter.priceKobo, status: "PENDING" },
    create: { userId, chapterId: id, reference, amountKobo: chapter.priceKobo, status: "PENDING" },
  });

  const origin = new URL(req.url).origin;

  try {
    const link = await initializeTransaction({
      email: session.user.email,
      amountKobo: chapter.priceKobo,
      reference,
      callbackUrl: `${origin}/api/unlocks/callback`,
      subaccountCode: author.paystackSubaccountCode,
      metadata: { chapterId: id, kind: "unlock" },
    });
    return NextResponse.json({ link });
  } catch (err) {
    console.error("Paystack chapter unlock init failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't start the payment" },
      { status: 502 }
    );
  }
}
