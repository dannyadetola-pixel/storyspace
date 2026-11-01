import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProxyUrl } from "@/lib/media";
import { getProfileStats } from "@/lib/profileStats";
import ProfileEditor from "@/components/ProfileEditor";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
        {label}
      </p>
      <p className="mt-2 text-2xl font-medium text-app-text dark:text-app-text-dark">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      isVerified: true,
      isPaymentEligible: true,
      books: {
        select: { id: true, title: true, genre: true, status: true },
        orderBy: { createdAt: "desc" },
      },
      verificationRequest: { select: { status: true } },
      paymentEligibilityRequest: { select: { status: true } },
    },
  });
  if (!user) redirect("/login");

  const stats = await getProfileStats(session.user.id);
  const avatar = toProxyUrl(user.avatarUrl);
  const initials = user.username.slice(0, 2).toUpperCase();

  const verificationLabel = user.isVerified
    ? "Verified"
    : user.verificationRequest?.status === "PENDING"
      ? "Pending review"
      : null;

  const paymentLabel = user.isPaymentEligible
    ? "Approved"
    : user.paymentEligibilityRequest?.status === "PENDING"
      ? "Pending review"
      : null;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-4">
        {/* Identity card */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-app-primary dark:bg-app-primary-dark flex items-center justify-center text-white font-medium shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-app-text dark:text-app-text-dark truncate">
              {user.name || user.username}
              {user.isVerified && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                />
              )}
            </p>
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60 truncate">
              @{user.username}
            </p>
            <p className="mt-1 text-sm text-app-text/70 dark:text-app-text-dark/70 line-clamp-2">
              {user.bio || "No bio yet"}
            </p>
          </div>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Followers" value={stats.followers} />
          <StatCard label="Following" value={stats.following} />
          <StatCard label="Total likes" value={stats.totalLikes} />
          <StatCard label="Book engagements" value={stats.bookEngagements} />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Books" value={stats.booksCount} />
          <StatCard label="Posts" value={stats.postsCount} />
          <StatCard label="Chapters" value={stats.chaptersCount} />
        </div>

        {/* Account status */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Account
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-app-text dark:text-app-text-dark">Verification</span>
            {verificationLabel ? (
              <span className="text-app-text/60 dark:text-app-text-dark/60">
                {verificationLabel}
              </span>
            ) : (
              <Link
                href="/verify"
                className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
              >
                Request
              </Link>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-app-text dark:text-app-text-dark">Payments</span>
            {paymentLabel ? (
              <span className="text-app-text/60 dark:text-app-text-dark/60">
                {paymentLabel}
              </span>
            ) : (
              <Link
                href="/payment-eligibility"
                className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
              >
                Request
              </Link>
            )}
          </div>
        </div>

        {/* Books */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
              Your books
            </p>
            <Link
              href="/books/new"
              className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              New book
            </Link>
          </div>
          {user.books.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
              You haven&rsquo;t started a book yet.
            </p>
          )}
          {user.books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.id}`}
              className="flex items-center justify-between rounded-xl border border-black/5 dark:border-white/10 p-3 hover:opacity-90"
            >
              <span className="text-sm text-app-text dark:text-app-text-dark">
                {book.title}
              </span>
              <span className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                {book.status === "ONGOING" ? "Ongoing" : "Complete"}
              </span>
            </Link>
          ))}
        </div>

        {/* Edit */}
        <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5">
          <p className="mb-4 text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Edit profile
          </p>
          <ProfileEditor
            initialName={user.name ?? ""}
            initialBio={user.bio ?? ""}
          />
        </div>
      </div>
    </main>
  );
}