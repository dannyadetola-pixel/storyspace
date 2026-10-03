import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      verificationRequest: { select: { status: true } },
      paymentEligibilityRequest: { select: { status: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-sm mx-auto space-y-3">
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          {user.username}
          {user.isVerified && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block w-4 h-4 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
            />
          )}
        </h1>
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          {user.bio || "No bio yet"}
        </p>

        <Link
          href="/books/new"
          className="inline-block pt-1 text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
        >
          Start a new book
        </Link>

        <div className="pt-3 space-y-1 border-t border-black/5 dark:border-white/10">
          {user.isVerified ? (
            <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
              Verified account
            </p>
          ) : user.verificationRequest?.status === "PENDING" ? (
            <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
              Verification request pending
            </p>
          ) : (
            <Link
              href="/verify"
              className="block text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              Request verification
            </Link>
          )}

          {user.isPaymentEligible ? (
            <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
              Approved for payments
            </p>
          ) : user.paymentEligibilityRequest?.status === "PENDING" ? (
            <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
              Payment eligibility request pending
            </p>
          ) : (
            <Link
              href="/payment-eligibility"
              className="block text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              Request payment eligibility
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
