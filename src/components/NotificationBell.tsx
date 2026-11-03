"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const POLL_MS = 15000;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications);
    setUnread(data.unreadCount);
  }, []);

  // Check for new notifications straight away, then every 15 seconds.
  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    // Opening the panel marks everything as read, so the dot clears.
    if (next && unread > 0) {
      await fetch("/api/notifications", { method: "POST" });
      setUnread(0);
      setItems((prev) => prev.map((i) => ({ ...i, read: true })));
    }
  }

  function timeAgo(iso: string) {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(iso).toLocaleDateString("en-NG", { timeZone: "Africa/Lagos" });
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
        className="relative w-10 h-10 rounded-full border border-black/10 dark:border-white/15 flex items-center justify-center text-app-text dark:text-app-text-dark"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8 a6 6 0 0 1 12 0 c0 7 3 9 3 9 H3 s3-2 3-9" />
          <path d="M10.3 21 a1.9 1.9 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-app-bg dark:ring-app-bg-dark"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto z-20 bg-app-surface dark:bg-app-surface-dark border border-black/10 dark:border-white/10 rounded-2xl shadow-lg">
          <p className="px-4 pt-3 pb-2 text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
            Notifications
          </p>
          {items.length === 0 && (
            <p className="px-4 pb-4 text-sm text-app-text/60 dark:text-app-text-dark/60">
              No notifications yet.
            </p>
          )}
          {items.map((item) => {
            const content = (
              <div className="flex gap-3 px-4 py-3">
                {!item.read && (
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-sm text-app-text dark:text-app-text-dark">
                    {item.message}
                  </p>
                  <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                    {timeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            );
            return item.link ? (
              <Link
                key={item.id}
                href={item.link}
                onClick={() => setOpen(false)}
                className="block hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              >
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}