import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Chats
        </h1>

        {sorted.length === 0 && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            No conversations yet — message someone from their profile to
            start one.
          </p>
        )}

        <div className="space-y-2">
          {sorted.map((conversation) => {
            // For a 1:1 chat, show the other person, not yourself.
            const other = conversation.participants.find(
              (p) => p.userId !== session.user.id
            );
            const label = conversation.isGroup
              ? conversation.name ?? "Group chat"
              : other?.user.username ?? "Unknown user";
            const lastMessage = conversation.messages[0];

            return (
              <Link
                key={conversation.id}
                href={`/chats/${conversation.id}`}
                className="block bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3 hover:opacity-90"
              >
                <div className="flex items-center text-sm font-medium text-app-text dark:text-app-text-dark">
                  {label}
                  {!conversation.isGroup && other?.user.isVerified && (
                    <span
                      aria-hidden="true"
                      className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                    />
                  )}
                </div>
                <p className="text-sm text-app-text/60 dark:text-app-text-dark/60 truncate">
                  {lastMessage ? lastMessage.body : "No messages yet"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
