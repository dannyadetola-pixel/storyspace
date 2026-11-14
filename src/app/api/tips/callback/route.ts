import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { markTipSuccessful } from "@/lib/tipPayments";

// Paystack sends the reader here after checkout. If the payment can't be
// confirmed, the tip stays PENDING, so the webhook can still settle it.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference =
    url.searchParams.get("reference") ?? url.searchParams.get("trxref");

  console.log("[tips/callback] hit | reference:", reference, "| query:", url.search);

  const tip = reference
    ? await prisma.tip.findUnique({
        where: { txRef: reference },
        include: { recipient: { select: { username: true } } },
      })
    : null;

  if (!tip || !reference) {
    console.log("[tips/callback] no tip found for reference:", reference);
    return NextResponse.redirect(`${url.origin}/`);
  }

  const back = (result: "paid=1" | "failed=1") =>
    NextResponse.redirect(
      `${url.origin}/tip/${tip.recipient.username}?${result}`
    );

  if (tip.status === "SUCCESSFUL") {
    console.log("[tips/callback] already successful:", reference);
    return back("paid=1");
  }

  const verified = await verifyTransaction(reference);
  const t = verified.data;
  console.log(
    "[tips/callback] verify | http ok:", verified.ok,
    "| message:", verified.message,
    "| status:", t?.status,
    "| currency:", t?.currency,
    "| amount:", t?.amount,
    "| expected:", tip.amountKobo,
    "| fees:", t?.fees
  );

  const matches =
    verified.ok &&
    t !== null &&
    t.status === "success" &&
    t.currency === "NGN" &&
    Number(t.amount) === Number(tip.amountKobo);

  if (!matches || !t) {
    console.log("[tips/callback] not confirmed; tip left PENDING for the webhook");
    return back("failed=1");
  }

  await markTipSuccessful(reference, String(t.id), Number(t.fees ?? 0));
  console.log("[tips/callback] recorded tip and earning:", reference);
  return back("paid=1");
}