"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MessageButton({ username }: { username: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't start that conversation");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/chats/${id}`);
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="rounded-full border border-black/10 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-app-text dark:text-app-text-dark disabled:opacity-60"
      >
        {loading ? "Starting…" : "Message"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
