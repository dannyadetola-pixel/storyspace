import { prisma } from "@/lib/prisma";
import { creatorShareKobo } from "@/lib/paystack";

// Marks a tip successful and writes one earnings record for the creator, after
// Paystack's fee. Safe to call twice: the second call changes nothing.
export async function markTipSuccessful(
  reference: string,
  paystackTransactionId?: string,
  feesKobo = 0
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

    // The creator's share, less the Paystack fee they now bear.
    const netKobo = Math.max(0, creatorShareKobo(tip.amountKobo) - feesKobo);

    await tx.earning.create({
      data: {
        userId: tip.recipientId,
        source: "TIP",
        amountKobo: netKobo,
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