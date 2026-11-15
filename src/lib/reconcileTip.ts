import { prisma } from "@/lib/prisma";
import { verifyTransaction } from "@/lib/paystack";
import { markTipSuccessful } from "@/lib/tipPayments";

export type ReconcileResult =
  | { outcome: "credited" }
  | { outcome: "already-credited" }
  | { outcome: "not-paid"; paystackStatus: string | null }
  | { outcome: "amount-mismatch"; charged: number; expected: number }
  | { outcome: "unknown-tip" }
  | { outcome: "error"; message: string };

// Checks one pending tip with Paystack and credits it only if Paystack confirms
// the payment. It never marks a tip failed: that decision stays with a person.
export async function reconcileTip(reference: string): Promise<ReconcileResult> {
  const tip = await prisma.tip.findUnique({
    where: { txRef: reference },
    select: { amountKobo: true, status: true },
  });
  if (!tip) return { outcome: "unknown-tip" };
  if (tip.status === "SUCCESSFUL") return { outcome: "already-credited" };

  const verified = await verifyTransaction(reference);
  if (!verified.ok || !verified.data) {
    return { outcome: "error", message: verified.message };
  }
  const t = verified.data;

  if (t.status !== "success") {
    return { outcome: "not-paid", paystackStatus: t.status ?? null };
  }
  if (t.currency !== "NGN") {
    return { outcome: "error", message: `Unexpected currency: ${t.currency}` };
  }
  if (Number(t.amount) < Number(tip.amountKobo)) {
    return {
      outcome: "amount-mismatch",
      charged: Number(t.amount),
      expected: Number(tip.amountKobo),
    };
  }

  await markTipSuccessful(
    reference,
    String(t.id),
    Number(t.fees ?? 0),
    Number(t.amount)
  );
  return { outcome: "credited" };
}