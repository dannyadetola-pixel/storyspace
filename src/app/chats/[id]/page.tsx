import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SendMessageForm from "@/components/SendMessageForm";
import MessageList from "@/components/MessageList";
import UserLink from "@/components/UserLink";
import Avatar from "@/components/Avatar";
import ChatDoodles from "@/components/ChatDoodles";
import GroupAvatarUpload from "@/components/GroupAvatarUpload";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const me = session?.user?.id;
  if (!me) redirect("/login");

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: { select: { username: true, avatarUrl: true, isVerified: true } },
        },
      },
    },
  });
  if (!conversation) notFound();

  const mine = conversation.participants.find((p) => p.userId === me);
  if (!mine) redirect("/chats");

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, senderId: true, createdAt: true },
  });

  // Dates can't be passed to the client component as-is, so send ISO strings.
  const initialMessages = messages.map((m) => ({
    id: m.id,
    body: m.body,
    senderId: m.senderId,
    createdAt: m.createdAt.toISOString(),
  }));

  const other = conversation.participants.find((p) => p.userId !== me) ?? null;
  const isGroup = conversation.isGroup;

  const participantsById = Object.fromEntries(
    conversation.participants.map((p) => [p.userId, p.user.username])
  );

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden px-4 py-10">
      <ChatDoodles />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col space-y-4">
        <Link
          href="/chats"
          className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
        >
          ← Chats
        </Link>

        <div className="flex items-center gap-3">
          <Avatar
            src={isGroup ? conversation.avatarUrl : other?.user.avatarUrl ?? null}
            kind={isGroup ? "group" : "user"}
            size={44}
          />
          <div className="min-w-0 flex-1">
            <p className="flex items-center text-base font-semibold text-app-text dark:text-app-text-dark">
              {isGroup ? (
                <span className="truncate">{conversation.name ?? "Group chat"}</span>
              ) : other ? (
                <UserLink
                  username={other.user.username}
                  isVerified={other.user.isVerified}
                  className="text-base font-semibold text-app-text dark:text-app-text-dark"
                />
              ) : (
                <span>Unknown user</span>
              )}
            </p>
            <p className="text-xs text-app-text/60 dark:text-app-text-dark/60">
              {isGroup
                ? `${conversation.participants.length} members`
                : other
                  ? `@${other.user.username}`
                  : ""}
            </p>
            {isGroup && mine.isAdmin && (
              <GroupAvatarUpload conversationId={conversation.id} />
            )}
          </div>
        </div>

        <MessageList
          key={conversation.id}
          conversationId={conversation.id}
          initialMessages={initialMessages}
          currentUserId={me}
          isGroup={isGroup}
          participantsById={participantsById}
        />

        <SendMessageForm conversationId={conversation.id} />
      </div>
    </main>
  );
}
