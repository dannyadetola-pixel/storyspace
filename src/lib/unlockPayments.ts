import { prisma } from "@/lib/prisma";
import { creatorShareKobo } from "@/lib/paystack";
import { notify } from "@/lib/notify";

// Marks a chapter unlock successful, writes one earnings record for the author,
// and notifies the author. Safe to call twice: the second call changes nothing
// and sends no second notification.
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
      userId: true,
      amountKobo: true,
      status: true,
      user: { select: { username: true } },
      chapter: {
        select: {
          id: true,
          title: true,
          bookId: true,
          book: { select: { title: true, userId: true } },
        },
      },
    },
  });
  if (!unlock) return null;
  if (unlock.status === "SUCCESSFUL") return unlock;

  const authorId = unlock.chapter.book.userId;

  const credited = await prisma.$transaction(async (tx) => {
    // Only one caller can move the unlock from PENDING to SUCCESSFUL.
    const claimed = await tx.chapterUnlock.updateMany({
      where: { id: unlock.id, status: "PENDING" },
      data: {
        status: "SUCCESSFUL",
        paidAt: new Date(),
        paystackTransactionId: paystackTransactionId ?? null,
      },
    });
    if (claimed.count === 0) return false;

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
    return true;
  });

  // Only the call that credited the unlock notifies the author, so a repeated
  // webhook or callback can't send the same notification twice.
  if (credited) {
    await notify({
      userId: authorId,
      actorId: unlock.userId,
      type: "CHAPTER_UNLOCKED",
      message: `${unlock.user.username} unlocked “${unlock.chapter.title}” in ${unlock.chapter.book.title}`,
      link: `/books/${unlock.chapter.bookId}/chapters/${unlock.chapter.id}`,
    });
  }

  return unlock;
}
