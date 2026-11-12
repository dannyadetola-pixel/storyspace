import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatChatTime } from "@/lib/chatTime";
import Avatar from "@/components/Avatar";
import VerifiedBadge from "@/components/VerifiedBadge";

export const dynamic = "force-dynamic";

export default async function ChatsPage() {
  const session = await auth();
  const me = session?.user?.id;
  if (!me) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: me } } },
    include: {
      participants: {
        include: {
          user: { select: { username: true, avatarUrl: true, isVerified: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { username: true } } },
      },
    },
  });

  // Most recent activity first. A chat with no messages sorts by when it was made.
  const rows = conversations
    .map((c) => {
      const last = c.messages[0] ?? null;
      const other = c.participants.find((p) => p.userId !== me) ?? null;
      const sortAt = (last?.createdAt ?? c.createdAt).getTime();
      return { c, last, other, sortAt };
    })
    .sort((a, b) => b.sortAt - a.sortAt);

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-md space-y-6">
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

        {rows.length === 0 && (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            No conversations yet. Message someone from their profile to start one.
          </p>
        )}

        {rows.length > 0 && (
          <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-app-surface dark:divide-white/10 dark:border-white/10 dark:bg-app-surface-dark">
            {rows.map(({ c, last, other }) => {
              const isGroup = c.isGroup;
              const name = isGroup
                ? c.name ?? "Group chat"
                : other?.user.username ?? "Unknown user";

              // WhatsApp-style preview: "You:" for your own messages, the
              // sender's name in groups, and plain text in one-to-one chats.
              const prefix = !last
                ? ""
                : last.senderId === me
                  ? "You: "
                  : isGroup
                    ? `${last.sender.username}: `
                    : "";
              const preview = last
                ? `${prefix}${last.body ?? "Sent a file"}`
                : "No messages yet";

              return (
                <Link
                  key={c.id}
                  href={`/chats/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                >
                  <Avatar
                    src={isGroup ? c.avatarUrl : other?.user.avatarUrl ?? null}
                    kind={isGroup ? "group" : "user"}
                    size={48}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="flex min-w-0 items-center text-sm font-medium text-app-text dark:text-app-text-dark">
                        <span className="truncate">{name}</span>
                        {!isGroup && other?.user.isVerified && <VerifiedBadge />}
                      </p>
                      {last && (
                        <time className="shrink-0 text-xs text-app-text/50 dark:text-app-text-dark/50">
                          {formatChatTime(last.createdAt)}
                        </time>
                      )}
                    </div>
                    <p className="truncate text-sm text-app-text/60 dark:text-app-text-dark/60">
                      {preview}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
