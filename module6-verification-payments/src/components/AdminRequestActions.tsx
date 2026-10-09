"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRequestActions({
  kind,
  requestId,
}: {
  kind: "verification-requests" | "payment-eligibility-requests";
  requestId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: "approve" | "reject") {
    setPending(true);
    setError("");

    const res = await fetch(`/api/admin/${kind}/${requestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
      setPending(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        onClick={() => decide("approve")}
        disabled={pending}
        className="text-sm font-medium text-app-primary dark:text-app-primary-dark disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => decide("reject")}
        disabled={pending}
        className="text-sm font-medium text-red-600 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
