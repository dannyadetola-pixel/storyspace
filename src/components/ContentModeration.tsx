"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ModerationPost = {
  id: string;
  caption: string | null;
  username: string;
  createdAt: string;
};

export type ModerationBook = {
  id: string;
  title: string;
  username: string;
  createdAt: string;
};

type Result = {
  ok: boolean;
  status: number;
  data: { error?: string; paidCount?: number } | null;
};

// Lists posts and books for the admin, each with a Remove button.
export default function ContentModeration({
  posts,
  books,
}: {
  posts: ModerationPost[];
  books: ModerationBook[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function send(
    kind: "post" | "book",
    id: string,
    reason: string,
    force: boolean
  ): Promise<Result> {
    const res = await fetch("/api/admin/content", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, reason, force }),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data };
  }

  async function remove(kind: "post" | "book", id: string, label: string) {
    const what = kind === "book" ? "book and all its chapters" : "post";

    // The reason is required, and the author sees it in their notification.
    const reason = window.prompt(
      `Why are you removing this ${what}? The author will see this message.\n\n"${label}"`
    );
    if (reason === null) return;
    const cleanReason = reason.trim();
    if (cleanReason.length < 5) {
      setError("Give a reason of at least 5 characters.");
      return;
    }

    if (
      !window.confirm(
        `Remove "${label}" for everyone?\n\nThis can't be undone. The author will be notified with your reason.`
      )
    ) {
      return;
    }

    setBusy(id);
    setError("");

    let result = await send(kind, id, cleanReason, false);

    // The server refuses books with paid chapters until they've been refunded.
    if (result.status === 409 && result.data?.paidCount) {
      const message = result.data.error ?? "This book has paid chapters.";
      const refunded = window.confirm(
        `${message}\n\nPress OK only if you have already refunded these readers in Paystack.`
      );
      if (!refunded) {
        setBusy(null);
        setError(message);
        return;
      }
      result = await send(kind, id, cleanReason, true);
    }

    setBusy(null);
    if (!result.ok) {
      setError(result.data?.error ?? "Couldn't remove it");
      return;
    }
    router.refresh();
  }

  const row =
    "flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-app-surface p-3 dark:border-white/10 dark:bg-app-surface-dark";

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
          Posts ({posts.length})
        </h2>
        {posts.length === 0 && (
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">No posts found.</p>
        )}
        {posts.map((p) => {
          const label = p.caption ?? "(no caption)";
          return (
            <div key={p.id} className={row}>
              <div className="min-w-0">
                <p className="truncate text-sm text-app-text dark:text-app-text-dark">{label}</p>
                <p className="text-xs text-app-text/60 dark:text-app-text-dark/60">
                  @{p.username} · {new Date(p.createdAt).toLocaleDateString("en-NG")} ·{" "}
                  <Link href={`/feed/${p.id}`} className="underline">
                    View
                  </Link>
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove("post", p.id, label)}
                disabled={busy === p.id}
                className="shrink-0 text-xs font-medium text-red-600 disabled:opacity-50"
              >
                {busy === p.id ? "Removing…" : "Remove"}
              </button>
            </div>
          );
        })}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
          Books ({books.length})
        </h2>
        {books.length === 0 && (
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">No books found.</p>
        )}
        {books.map((b) => (
          <div key={b.id} className={row}>
            <div className="min-w-0">
              <p className="truncate text-sm text-app-text dark:text-app-text-dark">{b.title}</p>
              <p className="text-xs text-app-text/60 dark:text-app-text-dark/60">
                @{b.username} · {new Date(b.createdAt).toLocaleDateString("en-NG")} ·{" "}
                <Link href={`/books/${b.id}`} className="underline">
                  View
                </Link>
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove("book", b.id, b.title)}
              disabled={busy === b.id}
              className="shrink-0 text-xs font-medium text-red-600 disabled:opacity-50"
            >
              {busy === b.id ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
