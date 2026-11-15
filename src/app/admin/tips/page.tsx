import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import TipReconcileList, { type StuckTip } from "@/components/TipReconcileList";

export const dynamic = "force-dynamic";

// A tip is treated as stuck if it's still pending five minutes after it was made,
// which is long enough for a normal webhook to have arrived.
const STUCK_AFTER_MS = 5 * 60 * 1000;

export default async function AdminTipsPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  const stuck = await prisma.tip.findMany({
    where: {
      status: "PENDING",
      createdAt: { lt: new Date(Date.now() - STUCK_AFTER_MS) },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
    include: {
      tipper: { select: { username: true } },
      recipient: { select: { username: true } },
    },
  });

  const items: StuckTip[] = stuck.map((t) => ({
    reference: t.txRef,
    amountKobo: t.amountKobo,
    tipper: t.tipper.username,
    recipient: t.recipient.username,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Stuck tips
          </h1>
          <Link
            href="/admin"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            Back to admin
          </Link>
        </div>
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          Tips still pending after five minutes. Checking one asks Paystack
          whether it was paid, and credits it only if it was.
        </p>
        <TipReconcileList items={items} />
      </div>
    </main>
  );
}