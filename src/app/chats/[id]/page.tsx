import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SendMessageForm from "@/components/SendMessageForm";
import MessageList from "@/components/MessageList";
import UserLink from "@/components/UserLink";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: { user: { select: { username: true, isVerified: true } } },
      },
    },
  });

  if (!conversation) notFound();

  const isParticipant = conversation.participants.some(
    (p) => p.userId === session.user.id
  );
  if (!isParticipant) redirect("/chats");

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, senderId: true },
  });

  const other = conversation.participants.find(
    (p) => p.userId !== session.user.id
  );

  // Lets the message list show sender names in group chats.
  const participantsById = Object.fromEntries(
    conversation.participants.map((p) => [p.userId, p.user.username])
  );

  return (
    <main className="min-h-screen px-4 py-10 flex flex-col">
      <div className="max-w-md w-full mx-auto flex flex-col flex-1 space-y-4">
        <div>
          <Link
            href="/chats"
            className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
          >
            ← Chats
          </Link>
          <h1 className="mt-1 text-lg font-medium text-app-text dark:text-app-text-dark">
            {conversation.isGroup ? (
              conversation.name ?? "Group chat"
            ) : other ? (
              <UserLink
                username={other.user.username}
                isVerified={other.user.isVerified}
                className="text-lg font-medium text-app-text dark:text-app-text-dark"
              />
            ) : (
              "Unknown user"
            )}
          </h1>
        </div>

        <MessageList
          conversationId={conversation.id}
          initialMessages={messages}
          currentUserId={session.user.id}
          isGroup={conversation.isGroup}
          participantsById={participantsById}
        />

        <SendMessageForm conversationId={conversation.id} />
      </div>
    </main>
  );
}