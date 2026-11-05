"use client";

import { useEffect, useState, type FormEvent } from "react";

type Pick = {
  id: string;
  position: number;
  book: { id: string; title: string; user: { username: string } };
};

type Result = {
  id: string;
  title: string;
  user: { username: string };
  editorPick: { id: string } | null;
};

export default function EditorPicksManager() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function loadPicks() {
    const res = await fetch("/api/admin/editor-picks", { cache: "no-store" });
    if (res.ok) setPicks(await res.json());
  }

  useEffect(() => {
    loadPicks();
  }, []);

  async function search(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/admin/books?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });
    if (res.ok) setResults(await res.json());
  }

  async function add(bookId: string) {
    setBusy(bookId);
    setError("");
    const res = await fetch("/api/admin/editor-picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    const data = await res.json().catch(() => null);
    setBusy(null);
    if (!res.ok) {
      setError(data?.error ?? "Couldn't add that book");
      return;
    }
    await loadPicks();
    setResults((prev) =>
      prev.map((r) => (r.id === bookId ? { ...r, editorPick: { id: "new" } } : r))
    );
  }

  async function remove(bookId: string) {
    setBusy(bookId);
    setError("");
    const res = await fetch("/api/admin/editor-picks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookId }),
    });
    setBusy(null);
    if (!res.ok) {
      setError("Couldn't remove that book");
      return;
    }
    await loadPicks();
    setResults((prev) =>
      prev.map((r) => (r.id === bookId ? { ...r, editorPick: null } : r))
    );
  }

  const fieldClass =
    "w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary";

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
          Add a book
        </p>
        <form onSubmit={search} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by book title"
            className={fieldClass}
          />
          <button
            type="submit"
            className="rounded-full bg-app-primary dark:bg-app-primary-dark text-white px-4 text-sm font-medium"
          >
            Search
          </button>
        </form>

        {results.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-app-text dark:text-app-text-dark">
                {r.title}
              </p>
              <p className="text-xs text-app-text/60 dark:text-app-text-dark/60">
                {r.user.username}
              </p>
            </div>
            {r.editorPick ? (
              <span className="text-xs text-app-text/50 dark:text-app-text-dark/50">
                In the row
              </span>
            ) : (
              <button
                type="button"
                onClick={() => add(r.id)}
                disabled={busy === r.id}
                className="text-xs font-medium text-app-primary dark:text-app-primary-dark disabled:opacity-50"
              >
                Add
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
          Current row ({picks.length})
        </p>
        {picks.length === 0 && (
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
            The row is empty. Search above to add a book.
          </p>
        )}
        {picks.map((pick, index) => (
          <div
            key={pick.id}
            className="flex items-center justify-between bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-app-text dark:text-app-text-dark">
                {index + 1}. {pick.book.title}
              </p>
              <p className="text-xs text-app-text/60 dark:text-app-text-dark/60">
                {pick.book.user.username}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(pick.book.id)}
              disabled={busy === pick.book.id}
              className="text-xs font-medium text-red-600 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
