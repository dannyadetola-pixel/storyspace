import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction, webhookSignatureValid } from "@/lib/paystack";
import { markTipSuccessful } from "@/lib/tipPayments";

// Paystack posts here after every payment, whether or not the reader came back
// to the site. This is what records tips when someone closes the checkout tab.
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  console.log("[tips/webhook] received | bytes:", raw.length, "| signature present:", signature !== "");

  if (!webhookSignatureValid(raw, signature)) {
    console.log("[tips/webhook] REJECTED: signature did not match");
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    console.log("[tips/webhook] REJECTED: body was not JSON");
    return new NextResponse("Bad payload", { status: 400 });
  }
  console.log("[tips/webhook] event:", event.event, "| reference:", event.data?.reference);

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
      "| amount:", t?.amount,
      "| tip found:", !!tip,
      "| tip status:", tip?.status
    );

    if (
      tip &&
      verified.ok &&
      t !== null &&
      t.status === "success" &&
      t.currency === "NGN" &&
      Number(t.amount) === Number(tip.amountKobo)
    ) {
      await markTipSuccessful(reference, String(t.id), Number(t.fees ?? 0));
      console.log("[tips/webhook] recorded tip and earning:", reference);
    }
  }

  return new NextResponse(null, { status: 200 });
}