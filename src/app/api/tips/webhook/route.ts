import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, webhookSignatureValid } from "@/lib/paystack";
import { markTipSuccessful } from "@/lib/tipPayments";

// Paystack posts here after every payment, whether or not the reader came back
// to the site. This is what records tips when someone closes the checkout tab.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  console.log("[tips/webhook] received | bytes:", raw.length);

  if (!webhookSignatureValid(raw, signature)) {
    console.log("[tips/webhook] REJECTED: signature did not match");
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

    const verified = await verifyTransaction(reference);
    const t = verified.data;
    const tip = await prisma.tip.findUnique({
      where: { txRef: reference },
      select: { amountKobo: true, status: true },
    });

    console.log(
      "[tips/webhook] verify | http ok:", verified.ok,
      "| status:", t?.status,
      "| charged:", t?.amount,
      "| tip amount:", tip?.amountKobo,
      "| tip status:", tip?.status
    );

    // Paystack may add its fee to the reader's charge, so the amount paid can be
    // more than the tip. Less than the tip is never accepted.
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
      console.log("[tips/webhook] recorded tip and earning:", reference);
    }
  }

  return new NextResponse(null, { status: 200 });
}