"use client";

import { useEffect, useRef, useState } from "react";
import UserLink from "@/components/UserLink";

type Message = {
  id: string;
  body: string | null;
  senderId: string;
  createdAt: string;
};

const POLL_MS = 3000;

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
  // Maps sender IDs to usernames so group messages can show who sent them.
  participantsById: Record<string, string>;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Fetch anything at or after this timestamp. Starts at the newest message
  // already on the page, so nothing is loaded twice.
  const cursorRef = useRef<string>(
    initialMessages.length > 0
      ? initialMessages[initialMessages.length - 1].createdAt
      : new Date(0).toISOString()
  );

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    async function poll() {
      // Skip the request while the tab is hidden, but keep the timer going.
      if (!active || document.hidden) {
        schedule();
        return;
      }

      controller = new AbortController();
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages?after=${encodeURIComponent(
            cursorRef.current
          )}`,
          { cache: "no-store", signal: controller.signal }
        );
        if (res.ok && active) {
          const incoming: Message[] = await res.json();
          if (incoming.length > 0) {
            cursorRef.current = incoming[incoming.length - 1].createdAt;
            setMessages((prev) => {
              const seen = new Set(prev.map((m) => m.id));
              const fresh = incoming.filter((m) => !seen.has(m.id));
              return fresh.length > 0 ? [...prev, ...fresh] : prev;
            });
          }
        }
      } catch {
        // Aborted on unmount, or a dropped request. Either way, the next tick tries again.
      } finally {
        schedule();
      }
    }

    // The next poll is scheduled only after the current one has finished,
    // so requests can never pile up behind each other.
    function schedule() {
      if (active) timer = setTimeout(poll, POLL_MS);
    }

    schedule();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      controller?.abort();
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
        const senderName = participantsById[message.senderId];

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
                  {senderName ? (
                    <UserLink
                      username={senderName}
                      className="text-app-secondary dark:text-app-secondary-dark"
                    />
                  ) : (
                    "Unknown"
                  )}
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