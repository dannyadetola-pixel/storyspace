"use client";

import { useEffect, useState } from "react";
import { clearBooks, deleteBook, listBooks, type OfflineBook } from "@/lib/offlineStore";

export default function OfflineLibrary() {
  const [books, setBooks] = useState<OfflineBook[] | null>(null);
  const [open, setOpen] = useState<OfflineBook | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [online, setOnline] = useState(true);

  async function refresh() {
    setBooks(await listBooks());
  }

  useEffect(() => {
    refresh();
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  async function remove(id: string) {
    await deleteBook(id);
    refresh();
  }

  async function clearAll() {
    if (!window.confirm("Remove all downloaded books from this device?")) return;
    await clearBooks();
    refresh();
  }

  if (open) {
    const chapter = open.chapters[chapterIndex];
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => {
            setOpen(null);
            setChapterIndex(0);
          }}
          className="text-sm text-app-text/60 underline underline-offset-2 dark:text-app-text-dark/60"
        >
          ← Library
        </button>

        <div>
          <h2 className="text-xl font-semibold text-app-text dark:text-app-text-dark">
            {open.title}
          </h2>
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
            by {open.user.username}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {open.chapters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChapterIndex(i)}
              className={`rounded-full border px-3 py-1 text-xs ${
                i === chapterIndex
                  ? "border-app-primary text-app-primary dark:border-app-primary-dark dark:text-app-primary-dark"
                  : "border-black/10 text-app-text/70 dark:border-white/15 dark:text-app-text-dark/70"
              }`}
            >
              {c.order}
              {c.locked ? " 🔒" : ""}
            </button>
          ))}
        </div>

        {chapter ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-app-text dark:text-app-text-dark">
              {chapter.title}
            </h3>
            <div className="rounded-2xl border border-black/5 bg-app-surface p-6 dark:border-white/10 dark:bg-app-surface-dark">
              {chapter.body === null ? (
                <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
                  This chapter is locked. Unlock it online to read it.
                </p>
              ) : (
                <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-app-text dark:text-app-text-dark">
                  {chapter.body}
                </div>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <button
                type="button"
                disabled={chapterIndex === 0}
                onClick={() => setChapterIndex((i) => i - 1)}
                className="text-app-primary disabled:opacity-40 dark:text-app-primary-dark"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={chapterIndex >= open.chapters.length - 1}
                onClick={() => setChapterIndex((i) => i + 1)}
                className="text-app-primary disabled:opacity-40 dark:text-app-primary-dark"
              >
                Next →
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
            This book has no published chapters yet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!online && (
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          You&rsquo;re offline. Showing the books saved on this device.
        </p>
      )}

      {books === null && (
        <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">Loading…</p>
      )}

      {books?.length === 0 && (
        <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
          Nothing saved yet. Open a book and tap &ldquo;Download for offline&rdquo;.
        </p>
      )}

      {books?.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-3 rounded-2xl border border-black/5 bg-app-surface p-3 dark:border-white/10 dark:bg-app-surface-dark"
        >
          <div className="h-16 w-11 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-app-primary to-app-secondary">
            {b.coverDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.coverDataUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setChapterIndex(0);
              setOpen(b);
            }}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-sm font-medium text-app-text dark:text-app-text-dark">
              {b.title}
            </p>
            <p className="text-xs text-app-text/60 dark:text-app-text-dark/60">
              {b.chapters.length} chapters · saved{" "}
              {new Date(b.savedAt).toLocaleDateString("en-NG")}
            </p>
          </button>
          <button
            type="button"
            onClick={() => remove(b.id)}
            className="text-xs font-medium text-red-600"
          >
            Remove
          </button>
        </div>
      ))}

      {books && books.length > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-app-text/60 underline underline-offset-2 dark:text-app-text-dark/60"
        >
          Clear all downloads
        </button>
      )}
    </div>
  );
}
