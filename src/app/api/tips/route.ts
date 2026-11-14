import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeTransaction } from "@/lib/paystack";
import { markTipFailed } from "@/lib/tipPayments";

const MIN_NGN = 100;
const MAX_NGN = 50000;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Log in to send a tip" }, { status: 401 });
  }

  const { username, amountNgn } = await req.json();
  const amount = Number(amountNgn);
  if (!Number.isInteger(amount) || amount < MIN_NGN || amount > MAX_NGN) {
    return NextResponse.json(
      { error: `Tips must be between ₦${MIN_NGN} and ₦${MAX_NGN}` },
      { status: 400 }
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { username: String(username ?? "") },
    select: {
      id: true,
      username: true,
      isPaymentEligible: true,
      paystackSubaccountCode: true,
    },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }
  if (recipient.id === session.user.id) {
    return NextResponse.json({ error: "You can't tip yourself" }, { status: 400 });
  }
  if (!recipient.isPaymentEligible || !recipient.paystackSubaccountCode) {
    return NextResponse.json(
      { error: "This creator isn't set up to receive tips yet" },
      { status: 400 }
    );
  }

  // Paystack references must be unique per attempt.
  const reference = `tip_${crypto.randomUUID()}`;
  const tip = await prisma.tip.create({
    data: {
      tipperId: session.user.id,
      recipientId: recipient.id,
      amountKobo: amount * 100,
      txRef: reference,
      status: "PENDING",
    },
  });

  // Paystack sends the reader back to this origin after payment, so the same
  // code works on localhost and on the live site.
  const origin = new URL(req.url).origin;

  try {
    const link = await initializeTransaction({
      email: session.user.email,
      amountKobo: amount * 100,
      reference,
      callbackUrl: `${origin}/api/tips/callback`,
      subaccountCode: recipient.paystackSubaccountCode,
      metadata: { tipId: tip.id, creator: recipient.username },
    });
    return NextResponse.json({ link });
  } catch (err) {
    console.error("Paystack tip init failed:", err);
    await markTipFailed(reference);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't start the payment" },
      { status: 502 }
    );
  }
}
