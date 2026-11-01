"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RevokeButton({
  userId,
  kind,
}: {
  userId: string;
  kind: "verification" | "payment";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function revoke() {
    const label = kind === "verification" ? "verification" : "payment approval";
    if (!window.confirm(`Revoke this user's ${label}?`)) return;

    setPending(true);
    setError("");

    const res = await fetch("/api/admin/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, kind }),
    });

    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't revoke");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button
        onClick={revoke}
        disabled={pending}
        className="text-xs font-medium text-red-600 disabled:opacity-50"
      >
        {pending ? "Revoking…" : "Revoke"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}