"use client";

import { logoutAction } from "@/app/actions";
import { clearLocalData } from "@/lib/clearLocalData";

// Clears offline data before signing out, but never blocks sign-out for long.
// If clearing fails or stalls, the reader is still signed out.
async function withTimeout(task: Promise<unknown>, ms: number) {
  await Promise.race([
    task.catch((err) => console.error("Clearing local data failed:", err)),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

export default function LogoutButton() {
  async function logout() {
    await withTimeout(clearLocalData(), 2000);
    await logoutAction();
  }

  return (
    <form action={logout}>
      <button
        type="submit"
        className="hover:text-app-text dark:hover:text-app-text-dark"
      >
        Log out
      </button>
    </form>
  );
}