import { prisma } from "@/lib/prisma";
import { creatorShareKobo } from "@/lib/paystack";

// Marks a chapter unlock successful and writes one earnings record for the
// author. Safe to call twice: the second call changes nothing.
//   feesKobo:    Paystack's fee on the payment.
//   chargedKobo: what the reader actually paid. If it's more than the price,
//                the reader paid the fee, so the author bears none of it.
export async function markUnlockSuccessful(
  reference: string,
  paystackTransactionId?: string,
  feesKobo = 0,
  chargedKobo?: number
) {
  const unlock = await prisma.chapterUnlock.findUnique({
    where: { reference },
    select: {
      id: true,
      amountKobo: true,
      status: true,
      chapter: { select: { book: { select: { userId: true } } } },
    },
  });
  if (!unlock) return null;
  if (unlock.status === "SUCCESSFUL") return unlock;

  const authorId = unlock.chapter.book.userId;

  await prisma.$transaction(async (tx) => {
    // Only one caller can move the unlock from PENDING to SUCCESSFUL.
    const claimed = await tx.chapterUnlock.updateMany({
      where: { id: unlock.id, status: "PENDING" },
      data: {
        status: "SUCCESSFUL",
        paidAt: new Date(),
        paystackTransactionId: paystackTransactionId ?? null,
      },
    });
    if (claimed.count === 0) return;

    const readerPaidFee =
      chargedKobo !== undefined && chargedKobo > unlock.amountKobo;
    const feeBorneByAuthor = readerPaidFee ? 0 : feesKobo;
    const netKobo = Math.max(
      0,
      creatorShareKobo(unlock.amountKobo) - feeBorneByAuthor
    );

    await tx.earning.create({
      data: {
        userId: authorId,
        source: "CHAPTER_UNLOCK",
        amountKobo: netKobo,
        status: "PENDING",
        reference,
      },
    });
  });

  return unlock;
}
