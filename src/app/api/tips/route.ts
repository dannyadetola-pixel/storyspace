import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      flutterwaveSubaccountId: true,
    },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Creator not found" }, { status: 404 });
  }
  if (recipient.id === session.user.id) {
    return NextResponse.json(
      { error: "You can't tip yourself" },
      { status: 400 }
    );
  }
  if (!recipient.isPaymentEligible || !recipient.flutterwaveSubaccountId) {
    return NextResponse.json(
      { error: "This creator isn't set up to receive tips yet" },
      { status: 400 }
    );
  }

  // Unique per attempt — Flutterwave rejects reused references.
  const txRef = `tip_${crypto.randomUUID()}`;

  const tip = await prisma.tip.create({
    data: {
      tipperId: session.user.id,
      recipientId: recipient.id,
      amountKobo: amount * 100,
      txRef,
      status: "PENDING",
    },
  });

  // Redirect comes back to this same origin, so localhost and the live
  // site each work without any environment variable.
  const origin = new URL(req.url).origin;

  try {
    const res = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount, // Flutterwave takes the major unit (naira) here
        currency: "NGN",
        redirect_url: `${origin}/api/tips/callback`,
        customer: {
          email: session.user.email,
          name: session.user.username ?? "StorySpace reader",
        },
        customizations: { title: `Tip for ${recipient.username}` },
        subaccounts: [{ id: recipient.flutterwaveSubaccountId }],
        meta: { tipId: tip.id },
      }),
    });

    const data = await res.json();
    console.log("[flutterwave] payment init response:", res.status, JSON.stringify(data));

    if (!res.ok || data.status !== "success" || !data.data?.link) {
      await prisma.tip.updateMany({
        where: { id: tip.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: data.message || "Couldn't start the payment" },
        { status: 502 }
      );
    }

    return NextResponse.json({ link: data.data.link });
  } catch (err) {
    console.error("Tip payment init failed:", err);
    await prisma.tip.updateMany({
      where: { id: tip.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "Couldn't reach the payment provider" },
      { status: 502 }
    );
  }
}
