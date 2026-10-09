"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewBookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, description }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    const book = await res.json();
    router.push(`/books/${book.id}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Start a new book
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label
            htmlFor="title"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Title
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
            htmlFor="genre"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Genre (optional)
          </label>
          <input
            id="genre"
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create book"}
        </button>
      </form>
    </main>
  );
}
