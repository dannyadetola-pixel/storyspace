import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { getMonthlyStats } from "@/lib/adminStats";
import AdminRequestActions from "@/components/AdminRequestActions";
import RevokeButton from "@/components/RevokeButton";
import MonthlyChart from "@/components/MonthlyChart";

export const dynamic = "force-dynamic";

const CREATOR_LABELS: Record<string, string> = {
  books: "Books and stories",
  photos: "Photos and posts",
  videos: "Videos and reels",
  other: "Something else",
};

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-app-text/50 dark:text-app-text-dark/50">{label}</dt>
      <dd className="min-w-0 break-all text-app-text dark:text-app-text-dark">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function LinkRow({ label, href }: { label: string; href: string | null | undefined }) {
  return (
    <div className="flex gap-2">
      <dt className="w-20 shrink-0 text-app-text/50 dark:text-app-text-dark/50">{label}</dt>
      <dd className="min-w-0 break-all">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            {href}
          </a>
        ) : (
          <span className="text-app-text/60 dark:text-app-text-dark/60">Not provided</span>
        )}
      </dd>
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  const [
    pendingVerification,
    pendingPayment,
    approvedVerified,
    approvedPayment,
    monthly,
    totalUsers,
  ] = await Promise.all([
    prisma.verificationRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            username: true,
            createdAt: true,
            _count: { select: { books: true, posts: true } },
          },
        },
      },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.paymentEligibilityRequest.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { username: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.user.findMany({
      where: { isVerified: true },
      select: { id: true, username: true, name: true },
      orderBy: { username: "asc" },
    }),
    prisma.user.findMany({
      where: { isPaymentEligible: true },
      select: { id: true, username: true, name: true, flutterwaveSubaccountId: true },
      orderBy: { username: "asc" },
    }),
    getMonthlyStats(12),
    prisma.user.count(),
  ]);

  const monthlyUsers = monthly.map((m) => ({ label: m.label, value: m.users }));
  const monthlyPosts = monthly.map((m) => ({ label: m.label, value: m.posts }));
  const monthlyChapters = monthly.map((m) => ({ label: m.label, value: m.chapters }));
  const monthlyTips = monthly.map((m) => ({ label: m.label, value: m.tipsNaira }));

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Admin
          </h1>
          <Link
            href="/"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            Back to site
          </Link>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
              Total users
            </p>
            <p className="mt-2 text-2xl font-medium text-app-text dark:text-app-text-dark">
              {totalUsers.toLocaleString()}
            </p>
          </div>
          <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
              Pending reviews
            </p>
            <p className="mt-2 text-2xl font-medium text-app-text dark:text-app-text-dark">
              {(pendingVerification.length + pendingPayment.length).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Monthly analytics */}
        <MonthlyChart title="New users · last 12 months" data={monthlyUsers} />
        <MonthlyChart title="Posts · last 12 months" data={monthlyPosts} />
        <MonthlyChart title="Chapters · last 12 months" data={monthlyChapters} />
        <MonthlyChart
          title="Tips · last 12 months (₦)"
          data={monthlyTips}
          format={(n) => `₦${n.toLocaleString()}`}
        />

        {/* Pending verification */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Pending verification
          </h2>
          {pendingVerification.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">Nothing pending.</p>
          )}
          {pendingVerification.map((request) => (
            <div
              key={request.id}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 space-y-3"
            >
              <div>
                <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
                  {request.user.username}
                </p>
                <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                  Joined {request.user.createdAt.toLocaleDateString("en-NG")} ·{" "}
                  {request.user._count.books} books · {request.user._count.posts} posts
                </p>
              </div>

              <dl className="text-sm space-y-1">
                <Row label="Full name" value={request.fullName} />
                <Row
                  label="Creates"
                  value={request.creatorType ? CREATOR_LABELS[request.creatorType] : null}
                />
                <LinkRow label="Profile" href={request.externalLink} />
                <LinkRow label="Sample" href={request.sampleLink} />
                <Row label="More info" value={request.reason} />
              </dl>

              <AdminRequestActions kind="verification-requests" requestId={request.id} />
            </div>
          ))}
        </section>

        {/* Pending payment */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Pending payment eligibility
          </h2>
          {pendingPayment.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">Nothing pending.</p>
          )}
          {pendingPayment.map((request) => (
            <div
              key={request.id}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 space-y-2"
            >
              <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
                {request.user.username}
              </p>
              <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                {request.accountName} · Acct: {request.bankAccountNo} · Bank code: {request.bankCode} · {request.phoneNumber}
              </p>
              <AdminRequestActions kind="payment-eligibility-requests" requestId={request.id} />
            </div>
          ))}
        </section>

        {/* Approved verification */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Verified accounts ({approvedVerified.length})
          </h2>
          {approvedVerified.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">No verified accounts yet.</p>
          )}
          {approvedVerified.map((u) => (
            <div
              key={u.id}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between"
            >
              <Link
                href={`/u/${u.username}`}
                className="text-sm font-medium text-app-text dark:text-app-text-dark underline underline-offset-2"
              >
                {u.name || u.username}
              </Link>
              <RevokeButton userId={u.id} kind="verification" />
            </div>
          ))}
        </section>

        {/* Approved payments */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Approved for payments ({approvedPayment.length})
          </h2>
          {approvedPayment.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">No approved payment accounts yet.</p>
          )}
          {approvedPayment.map((u) => (
            <div
              key={u.id}
              className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <Link
                  href={`/u/${u.username}`}
                  className="text-sm font-medium text-app-text dark:text-app-text-dark underline underline-offset-2"
                >
                  {u.name || u.username}
                </Link>
                <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                  {u.flutterwaveSubaccountId ? "Subaccount active" : "No subaccount"}
                </p>
              </div>
              <RevokeButton userId={u.id} kind="payment" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}