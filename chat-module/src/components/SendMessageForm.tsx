"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SendMessageForm({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't send that");
      setSubmitting(false);
      return;
    }

    setBody("");
    setSubmitting(false);
    // Not real-time yet — this re-runs the page's server-side data fetch so
    // the message you just sent actually shows up without a full reload.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message…"
          className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-transparent px-4 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="rounded-full bg-app-primary dark:bg-app-primary-dark text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
