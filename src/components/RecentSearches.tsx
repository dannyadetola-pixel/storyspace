"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Recent searches as tappable chips, with a Clear all button.
export default function RecentSearches({ items }: { items: string[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return null;

  async function clearAll() {
    setBusy(true);
    await fetch("/api/search/recent", { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-app-text/50 dark:text-app-text-dark/50">
          Recent
        </p>
        <button
          type="button"
          onClick={clearAll}
          disabled={busy}
          className="text-xs font-medium text-app-text/60 hover:underline disabled:opacity-50 dark:text-app-text-dark/60"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item}
            href={`/explore?q=${encodeURIComponent(item)}`}
            className="rounded-full bg-black/5 px-3 py-1 text-sm text-app-text dark:bg-white/10 dark:text-app-text-dark"
          >
            {item}
          </Link>
        ))}
      </div>
    </section>
  );
}
