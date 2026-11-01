import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserLink from "@/components/UserLink";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      participants: {
        include: { user: { select: { username: true, isVerified: true } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  // Sorted here rather than in the query — Prisma can't directly order
  // conversations by "their latest message's timestamp" in one call.
  const sorted = conversations.sort((a, b) => {
    const aTime = a.messages[0]?.createdAt ?? a.createdAt;
    const bTime = b.messages[0]?.createdAt ?? b.createdAt;
    return bTime.getTime() - aTime.getTime();
  });

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Chats
          </h1>
          <Link
            href="/chats/new-group"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            New group
          </Link>
        </div>

        {sorted.length === 0 && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            No conversations yet — message someone from their profile to
            start one.
          </p>
        )}

        <div className="space-y-2">
          {sorted.map((conversation) => {
            const other = conversation.participants.find(
              (p) => p.userId !== session.user.id
            );
            const lastMessage = conversation.messages[0];

            return (
              <div
                key={conversation.id}
                className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 space-y-1"
              >
                <div className="text-sm font-medium text-app-text dark:text-app-text-dark">
                  {conversation.isGroup ? (
                    <Link
                      href={`/chats/${conversation.id}`}
                      className="hover:underline underline-offset-2"
                    >
                      {conversation.name ?? "Group chat"}
                    </Link>
                  ) : other ? (
                    <UserLink
                      username={other.user.username}
                      isVerified={other.user.isVerified}
                    />
                  ) : (
                    <span>Unknown user</span>
                  )}
                </div>
                <Link
                  href={`/chats/${conversation.id}`}
                  className="block text-sm text-app-text/60 dark:text-app-text-dark/60 truncate hover:opacity-80"
                >
                  {lastMessage
                    ? lastMessage.body ?? "Sent a file"
                    : "No messages yet"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}