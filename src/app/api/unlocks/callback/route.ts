import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { markUnlockSuccessful } from "@/lib/unlockPayments";

// Paystack sends the reader here after checkout. If the payment can't be
// confirmed, the unlock stays PENDING, so the webhook can still settle it.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const reference =
    url.searchParams.get("reference") ?? url.searchParams.get("trxref");

  const unlock = reference
    ? await prisma.chapterUnlock.findUnique({
        where: { reference },
        select: {
          status: true,
          amountKobo: true,
          chapter: { select: { id: true, bookId: true } },
        },
      })
    : null;

  if (!unlock || !reference) {
    return NextResponse.redirect(`${url.origin}/`);
  }

  const back = (result: "paid" | "failed") =>
    NextResponse.redirect(
      `${url.origin}/books/${unlock.chapter.bookId}/chapters/${unlock.chapter.id}?unlock=${result}`
    );

  if (unlock.status === "SUCCESSFUL") return back("paid");

  const verified = await verifyTransaction(reference);
  const t = verified.data;

  // Paystack may add its fee to the reader's charge, so the amount paid can be
  // more than the price. Less than the price is never accepted.
  const matches =
    verified.ok &&
    t !== null &&
    t.status === "success" &&
    t.currency === "NGN" &&
    Number(t.amount) >= Number(unlock.amountKobo);

  if (!matches || !t) return back("failed");

  await markUnlockSuccessful(
    reference,
    String(t.id),
    Number(t.fees ?? 0),
    Number(t.amount)
  );
  return back("paid");
}
