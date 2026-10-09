import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  return <PaymentEligibilityForm />;
}
