"use client";

import { useState } from "react";

export default function LikeButton({
  targetType,
  targetId,
  initialLiked,
  initialCount,
}: {
  targetType: "POST" | "CHAPTER";
  targetId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);

    // Optimistic update — reverted below if the request actually fails.
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));

    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId }),
    });

    if (!res.ok) {
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
    }
    setPending(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="flex items-center gap-1.5 text-sm disabled:opacity-60"
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <svg
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        fill={liked ? "currentColor" : "none"}
        className={
          liked
            ? "w-5 h-5 text-app-primary dark:text-app-primary-dark"
            : "w-5 h-5 text-app-text/60 dark:text-app-text-dark/60"
        }
      >
        <path d="M12 20 C5 15 2 10.5 4.5 7 C6.5 4 10 4.5 12 8 C14 4.5 17.5 4 19.5 7 C22 10.5 19 15 12 20 Z" />
      </svg>
      <span className="text-app-text/70 dark:text-app-text-dark/70">
        {count}
      </span>
    </button>
  );
}
