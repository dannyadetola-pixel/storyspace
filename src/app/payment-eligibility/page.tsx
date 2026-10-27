import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNigerianBanks } from "@/lib/flutterwave";
import PaymentEligibilityForm from "./PaymentEligibilityForm";

export const dynamic = "force-dynamic";

export default async function PaymentEligibilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isPaymentEligible: true,
      paymentEligibilityRequest: { select: { status: true } },
    },
  });

  if (user?.isPaymentEligible) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          You&rsquo;re already approved for payments.
        </p>
      </main>
    );
  }

  if (user?.paymentEligibilityRequest?.status === "PENDING") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          Your payment eligibility request is already pending review.
        </p>
      </main>
    );
  }

  // If this fails (e.g. the Flutterwave key isn't set up correctly yet),
  // the form still renders with an empty list rather than crashing the
  // whole page — it just falls back to a plain text bank-code input.
  let banks: { code: string; name: string }[] = [];
  try {
    banks = await getNigerianBanks();
  } catch (err) {
    console.error("Failed to load bank list:", err);
  }

  return <PaymentEligibilityForm banks={banks} />;
}
