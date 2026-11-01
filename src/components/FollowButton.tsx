"use client";

import { useState } from "react";

export default function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setPending(true);
    setError("");

    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    const data = await res.json().catch(() => null);

    setPending(false);
    if (!res.ok) {
      setError(data?.error ?? "Couldn't update follow");
      return;
    }
    setFollowing(data.following);
  }

  return (
    <div>
      <button
        onClick={toggle}
        disabled={pending}
        className={`rounded-full px-4 py-1.5 text-sm font-medium disabled:opacity-60 ${
          following
            ? "border border-black/10 dark:border-white/15 text-app-text dark:text-app-text-dark"
            : "bg-app-primary dark:bg-app-primary-dark text-white"
        }`}
      >
        {following ? "Following" : "Follow"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}