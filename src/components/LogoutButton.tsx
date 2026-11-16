"use client";

import { logoutAction } from "@/app/actions";
import { clearLocalData } from "@/lib/clearLocalData";

// Clears this device's offline books and cached pages before signing out, so
// the next person on a shared device can't read them.
export default function LogoutButton() {
  async function logout() {
    await clearLocalData();
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
