import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, webhookSignatureValid } from "@/lib/paystack";
import { markTipSuccessful } from "@/lib/tipPayments";
import { markUnlockSuccessful } from "@/lib/unlockPayments";

// Paystack posts here after every payment, whether or not the reader came back
// to the site. This records tips and chapter unlocks when the reader closes
// the checkout tab.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!webhookSignatureValid(raw, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse("Bad payload", { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;

    // Confirm the payment with Paystack before trusting the webhook.
    const verified = await verifyTransaction(reference);
    const t = verified.data;

    if (reference.startsWith("unlock_")) {
      const unlock = await prisma.chapterUnlock.findUnique({
        where: { reference },
        select: { amountKobo: true },
      });
      if (
        unlock &&
        verified.ok &&
        t !== null &&
        t.status === "success" &&
        t.currency === "NGN" &&
        Number(t.amount) >= Number(unlock.amountKobo)
      ) {
        await markUnlockSuccessful(
          reference,
          String(t.id),
          Number(t.fees ?? 0),
          Number(t.amount)
        );
      }
    } else {
      const tip = await prisma.tip.findUnique({
        where: { txRef: reference },
        select: { amountKobo: true },
      });
      if (
        tip &&
        verified.ok &&
        t !== null &&
        t.status === "success" &&
        t.currency === "NGN" &&
        Number(t.amount) >= Number(tip.amountKobo)
      ) {
        await markTipSuccessful(
          reference,
          String(t.id),
          Number(t.fees ?? 0),
          Number(t.amount)
        );
      }
    }
  }

  // Once the signature is valid, always answer 200, so Paystack doesn't retry
  // events we've already handled.
  return new NextResponse(null, { status: 200 });
}
