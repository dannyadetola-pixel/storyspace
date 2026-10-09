"use client";

import { useState } from "react";

export default function ShareButton({
  path,
  title,
}: {
  path: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${path}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User closed the share sheet without picking anything — not an error.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Share"
      className="flex items-center gap-1.5 text-sm text-app-text/60 dark:text-app-text-dark/60"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5 L15.4 17.5 M15.4 6.5 L8.6 10.5" />
      </svg>
      {copied && <span className="text-xs">Copied!</span>}
    </button>
  );
}
