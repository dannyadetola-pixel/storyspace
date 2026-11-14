import { prisma } from "@/lib/prisma";
import { creatorShareKobo } from "@/lib/paystack";

// Marks a tip successful and writes one earnings record for the creator.
// Safe to call twice: the second call finds the tip already successful and
// changes nothing, so a tip can never be recorded twice.
export async function markTipSuccessful(
  reference: string,
  paystackTransactionId?: string
) {
  const tip = await prisma.tip.findUnique({
    where: { txRef: reference },
    select: { id: true, recipientId: true, amountKobo: true, status: true },
  });
  if (!tip) return null;
  if (tip.status === "SUCCESSFUL") return tip;

  await prisma.$transaction(async (tx) => {
    // Only one caller can move the tip from PENDING to SUCCESSFUL.
    const claimed = await tx.tip.updateMany({
      where: { id: tip.id, status: "PENDING" },
      data: {
        status: "SUCCESSFUL",
        paidAt: new Date(),
        paystackTransactionId: paystackTransactionId ?? null,
      },
    });
    if (claimed.count === 0) return;

    await tx.earning.create({
      data: {
        userId: tip.recipientId,
        source: "TIP",
        amountKobo: creatorShareKobo(tip.amountKobo),
        status: "PENDING",
        reference,
      },
    });
  });

  return tip;
}

// Marks a tip failed, but only if it's still pending.
export async function markTipFailed(reference: string) {
  await prisma.tip.updateMany({
    where: { txRef: reference, status: "PENDING" },
    data: { status: "FAILED" },
  });
}
