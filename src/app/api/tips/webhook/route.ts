import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, webhookSignatureValid } from "@/lib/paystack";
import { markTipSuccessful } from "@/lib/tipPayments";

// Paystack posts here after every payment, whether or not the reader came back
// to the site. This is what records tips when someone closes the checkout tab.
export async function POST(req: Request) {
  // Read the raw text, because the signature is computed over the exact bytes.
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!webhookSignatureValid(raw, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
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
      Number(t.amount) === Number(tip.amountKobo)
    ) {
      // Paystack's fee is passed through, so the creator's earning is net of it.
      await markTipSuccessful(reference, String(t.id), Number(t.fees ?? 0));
    }
  }

  // Always answer 200 once the signature is valid, so Paystack doesn't retry
  // events we've already handled.
  return new NextResponse(null, { status: 200 });
}