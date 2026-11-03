"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ChapterValues = {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
};

const fieldClass =
  "w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark";
const labelClass =
  "block text-xs uppercase tracking-wide mb-1 text-app-text/50 dark:text-app-text-dark/50";

type Action = "draft" | "publish" | "save" | "unpublish";

export default function ChapterForm({
  bookId,
  chapter,
}: {
  bookId: string;
  chapter?: ChapterValues;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(chapter?.title ?? "");
  const [body, setBody] = useState(chapter?.body ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);

  const isPublished = chapter?.isPublished ?? false;
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  async function save(action: Action) {
    setBusy(action);
    setError("");

    const headers = { "Content-Type": "application/json" };
    const res = chapter
      ? await fetch(`/api/books/${bookId}/chapters/${chapter.id}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            title,
            body,
            // "save" leaves the publish state alone; the others set it explicitly.
            ...(action === "publish" ? { publish: true } : {}),
            ...(action === "draft" || action === "unpublish" ? { publish: false } : {}),
          }),
        })
      : await fetch(`/api/books/${bookId}/chapters`, {
          method: "POST",
          headers,
          body: JSON.stringify({ title, body, publish: action === "publish" }),
        });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't save the chapter");
      setBusy(null);
      return;
    }

    router.push(`/books/${bookId}`);
    router.refresh();
  }

  const disabled = busy !== null;
  const base = "rounded-full px-5 py-2 text-sm font-medium disabled:opacity-60";
  const primary = `${base} bg-app-primary dark:bg-app-primary-dark text-white`;
  const secondary = `${base} border border-black/10 dark:border-white/15 text-app-text dark:text-app-text-dark`;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label htmlFor="chapterTitle" className={labelClass}>Chapter title</label>
        <input
          id="chapterTitle"
          type="text"
          maxLength={150}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="chapterBody" className={labelClass}>Chapter text</label>
        <textarea
          id="chapterBody"
          rows={18}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={`${fieldClass} font-serif leading-relaxed`}
        />
        <p className="mt-1 text-xs text-app-text/50 dark:text-app-text-dark/50">
          {wordCount} words. The unlock price is set from this count when the chapter is saved.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isPublished ? (
          <>
            <button type="button" disabled={disabled} onClick={() => save("save")} className={primary}>
              {busy === "save" ? "Saving…" : "Save changes"}
            </button>
            <button type="button" disabled={disabled} onClick={() => save("unpublish")} className={secondary}>
              {busy === "unpublish" ? "Unpublishing…" : "Unpublish"}
            </button>
          </>
        ) : (
          <>
            <button type="button" disabled={disabled} onClick={() => save("publish")} className={primary}>
              {busy === "publish" ? "Publishing…" : "Publish"}
            </button>
            <button type="button" disabled={disabled} onClick={() => save("draft")} className={secondary}>
              {busy === "draft" ? "Saving…" : "Save draft"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}