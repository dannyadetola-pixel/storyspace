import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SendMessageForm from "@/components/SendMessageForm";

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
    include: { sender: { select: { username: true } } },
  });

  const other = conversation.participants.find(
    (p) => p.userId !== session.user.id
  );
  const title = conversation.isGroup
    ? conversation.name ?? "Group chat"
    : other?.user.username ?? "Unknown user";

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
            {title}
            {!conversation.isGroup && other?.user.isVerified && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block w-3 h-3 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
              />
            )}
          </h1>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
              No messages yet — say hello.
            </p>
          )}
          {messages.map((message) => {
            const isMine = message.senderId === session.user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={
                    isMine
                      ? "bg-app-primary dark:bg-app-primary-dark text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[75%] text-sm"
                      : "bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 text-app-text dark:text-app-text-dark rounded-2xl rounded-bl-sm px-4 py-2 max-w-[75%] text-sm"
                  }
                >
                  {message.body}
                </div>
              </div>
            );
          })}
        </div>

        <SendMessageForm conversationId={conversation.id} />
      </div>
    </main>
  );
}
