"use client";

import { logoutAction } from "@/app/actions";

export default function LogoutButton() {
  return (
    <form
      // Safe here because this is a Client Component — the same onClick
      // placed directly in Header.tsx (a Server Component) is what broke
      // the live site, since Server Components can't carry event handlers.
      onClick={(e) => e.stopPropagation()}
      action={logoutAction}
    >
      <button
        type="submit"
        className="hover:text-app-text dark:hover:text-app-text-dark"
      >
        Log out
      </button>
    </form>
  );
}
