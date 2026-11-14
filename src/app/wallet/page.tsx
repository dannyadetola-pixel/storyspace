import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Kobo to a naira string, e.g. 175000 -> ₦1,750.00
function naira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-NG", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-app-surface p-4 dark:border-white/10 dark:bg-app-surface-dark">
      <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-app-text dark:text-app-text-dark">
        {value}
      </p>
    </div>
  );
}

export default async function WalletPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [all, thisMonth, recent, user] = await Promise.all([
    prisma.earning.aggregate({
      where: { userId, source: "TIP" },
      _sum: { amountKobo: true },
      _count: { _all: true },
    }),
    prisma.earning.aggregate({
      where: { userId, source: "TIP", createdAt: { gte: startOfMonth } },
      _sum: { amountKobo: true },
    }),
    prisma.earning.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, amountKobo: true, createdAt: true, source: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { isPaymentEligible: true },
    }),
  ]);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-app-text dark:text-app-text-dark">
            Wallet
          </h1>
          <p className="mt-1 text-sm text-app-text/60 dark:text-app-text-dark/60">
            Your earnings from tips. Paystack pays these straight to your bank
            account, so this page shows what you&rsquo;ve earned, not a balance
            to withdraw.
          </p>
        </div>

        {!user?.isPaymentEligible && (
          <div className="rounded-2xl border border-black/10 p-4 text-sm text-app-text/80 dark:border-white/15 dark:text-app-text-dark/80">
            You need approval to receive payments before tips can reach you.{" "}
            <Link
              href="/payment-eligibility"
              className="font-medium text-app-primary underline underline-offset-2 dark:text-app-primary-dark"
            >
              Request payment eligibility
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total earned" value={naira(all._sum.amountKobo ?? 0)} />
          <StatCard label="This month" value={naira(thisMonth._sum.amountKobo ?? 0)} />
        </div>
        <StatCard label="Tips received" value={all._count._all.toLocaleString()} />

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Recent activity
          </p>
          {recent.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
              No earnings yet. They&rsquo;ll appear here when readers tip you.
            </p>
          )}
          <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-app-surface dark:divide-white/10 dark:border-white/10 dark:bg-app-surface-dark">
            {recent.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-app-text dark:text-app-text-dark">
                    Tip received
                  </p>
                  <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                    {formatDate(e.createdAt)}
                  </p>
                </div>
                <p className="text-sm font-medium text-app-primary dark:text-app-primary-dark">
                  +{naira(e.amountKobo)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
