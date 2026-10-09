"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";

export default function NewChapterPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch(`/api/books/${params.id}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push(`/books/${params.id}`);
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Write a new chapter
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label
            htmlFor="title"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Chapter title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <div>
          <label
            htmlFor="body"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Chapter text
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={16}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 font-serif text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
          <p className="mt-1 text-xs text-app-text/60 dark:text-app-text-dark/60">
            {wordCount} words — the unlock price is set automatically from
            this count when you publish, not chosen by you.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Publishing…" : "Publish chapter"}
        </button>
      </form>
    </main>
  );
}
