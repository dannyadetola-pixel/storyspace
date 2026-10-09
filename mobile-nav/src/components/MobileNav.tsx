"use client";

import { useState } from "react";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-1 text-app-text/70 dark:text-app-text-dark/70"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="w-6 h-6"
        >
          {open ? (
            <path d="M6 6 L18 18 M18 6 L6 18" />
          ) : (
            <path d="M3 6h18M3 12h18M3 18h18" />
          )}
        </svg>
      </button>

      {open && (
        // Clicking anywhere in here — including a link, via bubbling —
        // closes the menu, so it doesn't stay open after navigating away.
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full mt-2 w-48 bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-xl shadow-lg p-2 flex flex-col text-sm text-app-text/70 dark:text-app-text-dark/70 z-50 [&_a]:px-3 [&_a]:py-2 [&_a]:rounded-lg [&_a]:block [&_form]:px-0 [&_button]:w-full [&_button]:text-left [&_button]:px-3 [&_button]:py-2 [&_button]:rounded-lg [&_a:hover]:bg-black/[0.03] dark:[&_a:hover]:bg-white/[0.05] [&_button:hover]:bg-black/[0.03] dark:[&_button:hover]:bg-white/[0.05]"
        >
          {children}
        </div>
      )}
    </div>
  );
}
