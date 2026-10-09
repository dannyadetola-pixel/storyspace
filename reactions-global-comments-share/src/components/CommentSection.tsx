"use client";

import { useState, type FormEvent } from "react";

type CommentData = {
  id: string;
  body: string;
  user: { username: string; isVerified: boolean };
};

export default function CommentSection({
  targetType,
  targetId,
  initialCount,
}: {
  targetType: "POST" | "CHAPTER";
  targetId: string;
  initialCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentData[] | null>(null);
  const [count, setCount] = useState(initialCount);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && comments === null) {
      setLoading(true);
      const res = await fetch(
        `/api/comments?targetType=${targetType}&targetId=${targetId}`
      );
      if (res.ok) setComments(await res.json());
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, body }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...(prev ?? []), newComment]);
      setCount((c) => c + 1);
      setBody("");
    } else {
      const data = await res.json().catch(() => null);
      setError(
        res.status === 401
          ? "Log in to comment"
          : data?.error ?? "Couldn't post that comment"
      );
    }
    setSubmitting(false);
  }

  return (
    <div>
      <button
        onClick={toggleOpen}
        aria-label="Comments"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm text-app-text/60 dark:text-app-text-dark/60"
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
          <path d="M4 5 H20 C21 5 22 6 22 7 V16 C22 17 21 18 20 18 H9 L5 22 V18 H4 C3 18 2 17 2 16 V7 C2 6 3 5 4 5 Z" />
        </svg>
        <span>{count}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-black/5 dark:border-white/10 pt-3">
          {loading && (
            <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
              Loading comments…
            </p>
          )}
          {comments?.map((c) => (
            <div key={c.id} className="text-sm">
              <span className="font-medium text-app-text dark:text-app-text-dark">
                {c.user.username}
              </span>
              {c.user.isVerified && (
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block w-2.5 h-2.5 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
                />
              )}
              <span className="text-app-text/80 dark:text-app-text-dark/80">
                {" "}
                {c.body}
              </span>
            </div>
          ))}
          {comments?.length === 0 && (
            <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
              No comments yet.
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-transparent px-3 py-1.5 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
            />
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="text-sm font-medium text-app-primary dark:text-app-primary-dark disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
