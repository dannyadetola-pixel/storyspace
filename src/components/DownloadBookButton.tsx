"use client";

import { useEffect, useState } from "react";
import { deleteBook, getBook, saveBook } from "@/lib/offlineStore";
import { toProxyUrl } from "@/lib/media";

// Turns the cover into a data URL, so it's stored on the device and shows
// offline. Returns null if the cover can't be fetched.
async function coverToDataUrl(coverUrl: string | null): Promise<string | null> {
  const src = toProxyUrl(coverUrl);
  if (!src) return null;
  try {
    const res = await fetch(src, { cache: "no-store" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export default function DownloadBookButton({ bookId }: { bookId: string }) {
  const [saved, setSaved] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBook(bookId)
      .then((b) => setSaved(!!b))
      .catch(() => setSaved(false));
  }, [bookId]);

  async function download() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/books/${bookId}/offline`, { cache: "no-store" });
      if (!res.ok) throw new Error("Couldn't download this book");
      const data = await res.json();
      const coverDataUrl = await coverToDataUrl(data.coverUrl ?? null);
      await saveBook({ ...data, coverDataUrl });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't download this book");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    await deleteBook(bookId);
    setSaved(false);
  }

  if (saved === null) return null;

  return (
    <div className="flex items-center gap-2">
      {saved ? (
        <button
          type="button"
          onClick={remove}
          className="rounded-full border border-black/10 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-app-text dark:text-app-text-dark"
        >
          Downloaded · Remove
        </button>
      ) : (
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="rounded-full border border-black/10 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-app-text dark:text-app-text-dark disabled:opacity-60"
        >
          {busy ? "Downloading…" : "Download for offline"}
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
