import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toProxyUrl } from "@/lib/media";
import { getProfileStats } from "@/lib/profileStats";
import MessageButton from "@/components/MessageButton";
import TipButton from "@/components/TipButton";
import FollowButton from "@/components/FollowButton";

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

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
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
    },
  });

  if (!user) notFound();

  const isOwnProfile = session?.user?.id === user.id;
  const viewerIsSignedIn = !!session?.user;

  const [stats, followRow] = await Promise.all([
    getProfileStats(user.id),
    session?.user && !isOwnProfile
      ? prisma.follow.findUnique({
          where: {
            followerId_followedId: {
              followerId: session.user.id,
              followedId: user.id,
            },
          },
        })
      : null,
  ]);

  const avatar = toProxyUrl(user.avatarUrl);
  const initials = user.username.slice(0, 2).toUpperCase();

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
            <p className="mt-1 text-sm text-app-text/70 dark:text-app-text-dark/70">
              {user.bio || "No bio yet"}
            </p>
          </div>
        </div>

        {/* Actions — shown only to other signed-in users */}
        {viewerIsSignedIn && !isOwnProfile && (
          <div className="flex flex-wrap items-center gap-2">
            <FollowButton
              username={user.username}
              initialFollowing={!!followRow}
            />
            <MessageButton username={user.username} />
            {user.isPaymentEligible && <TipButton username={user.username} />}
          </div>
        )}

        {/* Analytics */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Followers" value={stats.followers} />
          <StatCard label="Following" value={stats.following} />
          <StatCard label="Total likes" value={stats.totalLikes} />
          <StatCard label="Book engagements" value={stats.bookEngagements} />
        </div>

        {/* Books */}
        {user.books.length > 0 && (
          <div className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-3">
            <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
              Books
            </p>
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
        )}
      </div>
    </main>
  );
}