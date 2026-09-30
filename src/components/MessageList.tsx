"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Message = {
  id: string;
  body: string | null;
  senderId: string;
};

// Public-safe client — the anon key is designed to be exposed in the
// browser, unlike the secret key used server-side for Storage/admin work.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MessageList({
  conversationId,
  initialMessages,
  currentUserId,
  isGroup,
  participantsById,
}: {
  conversationId: string;
  initialMessages: Message[];
  currentUserId: string;
  isGroup: boolean;
  // Live messages arrive as raw rows with only a senderId — this maps IDs
  // back to usernames so group messages can show who sent them.
  participantsById: Record<string, string>;
}) {
  const [messages, setMessages] = useState(initialMessages);

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <div className="flex-1 space-y-2 overflow-y-auto">
      {messages.length === 0 && (
        <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
          No messages yet — say hello.
        </p>
      )}
      {messages.map((message) => {
        const isMine = message.senderId === currentUserId;
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
              {isGroup && !isMine && (
                <p className="text-xs font-medium text-app-secondary dark:text-app-secondary-dark mb-0.5">
                  {participantsById[message.senderId] ?? "Unknown"}
                </p>
              )}
              {message.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
