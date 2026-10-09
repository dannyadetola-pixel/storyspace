import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import AdminRequestActions from "@/components/AdminRequestActions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  const [verificationRequests, paymentRequests] = await Promise.all([
    prisma.verificationRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { username: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.paymentEligibilityRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { username: true } } },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Admin
        </h1>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Verification requests
          </h2>
          {verificationRequests.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
              Nothing pending.
            </p>
          )}
          {verificationRequests.map((request) => (
            <div
              key={request.id}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 space-y-2"
            >
              <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
                {request.user.username}
              </p>
              {request.reason && (
                <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                  {request.reason}
                </p>
              )}
              <AdminRequestActions
                kind="verification-requests"
                requestId={request.id}
              />
            </div>
          ))}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Payment eligibility requests
          </h2>
          {paymentRequests.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
              Nothing pending.
            </p>
          )}
          {paymentRequests.map((request) => (
            <div
              key={request.id}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 space-y-2"
            >
              <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
                {request.user.username}
              </p>
              <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                Acct: {request.bankAccountNo} · Bank code: {request.bankCode}
              </p>
              <AdminRequestActions
                kind="payment-eligibility-requests"
                requestId={request.id}
              />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
