import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { markTipFailed, markTipSuccessful } from "@/lib/tipPayments";

// Paystack sends the reader here after checkout, with the reference in the URL.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference = url.searchParams.get("reference") ?? url.searchParams.get("trxref");

  const tip = reference
    ? await prisma.tip.findUnique({
        where: { txRef: reference },
        include: { recipient: { select: { username: true } } },
      })
    : null;

  if (!tip || !reference) {
    return NextResponse.redirect(`${url.origin}/`);
  }

  const back = (result: "paid=1" | "failed=1") =>
    NextResponse.redirect(`${url.origin}/tip/${tip.recipient.username}?${result}`);

  if (tip.status === "SUCCESSFUL") return back("paid=1");

  // The redirect is only a claim from the browser. Ask Paystack directly.
  const verified = await verifyTransaction(reference);
  const t = verified.data;
  const matches =
    verified.ok &&
    t !== null &&
    t.status === "success" &&
    t.currency === "NGN" &&
    t.amount === tip.amountKobo;

  if (!matches || !t) {
    await markTipFailed(reference);
    return back("failed=1");
  }

  await markTipSuccessful(reference, String(t.id));
  return back("paid=1");
}
