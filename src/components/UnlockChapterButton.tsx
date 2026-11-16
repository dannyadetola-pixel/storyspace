"use client";

import { useState } from "react";

export default function UnlockChapterButton({
  chapterId,
  priceLabel,
}: {
  chapterId: string;
  priceLabel: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function unlock() {
    setBusy(true);
    setError("");

    const res = await fetch(`/api/chapters/${chapterId}/unlock`, { method: "POST" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.link) {
      setError(data?.error ?? "Couldn't start the payment");
      setBusy(false);
      return;
    }
    window.location.href = data.link;
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={unlock}
        disabled={busy}
        className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {busy ? "Opening checkout…" : `Unlock for ${priceLabel}`}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
