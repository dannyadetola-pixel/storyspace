"use client";

import { useState } from "react";
import { logoutAction } from "@/app/actions";
import { clearLocalData } from "@/lib/clearLocalData";

// Clears offline data, then signs out. The sign-out runs from the click handler,
// not from a form, so it doesn't depend on the form staying on the page.
export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  async function logout() {
    if (busy) return;
    setBusy(true);
    try {
      // Give clearing at most two seconds; never block sign-out on it.
      await Promise.race([
        clearLocalData().catch((err) => console.error("Clearing local data failed:", err)),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
      await logoutAction();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="hover:text-app-text disabled:opacity-60 dark:hover:text-app-text-dark"
    >
      {busy ? "Logging out…" : "Log out"}
    </button>
  );
}