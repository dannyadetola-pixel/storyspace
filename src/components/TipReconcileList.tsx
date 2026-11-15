"use client";

import { useState } from "react";
import type { ReconcileResult } from "@/lib/reconcileTip";

export type StuckTip = {
  reference: string;
  amountKobo: number;
  tipper: string;
  recipient: string;
  createdAt: string;
};

function naira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function describe(r: ReconcileResult | { error: string }): string {
  if ("error" in r) return r.error;
  switch (r.outcome) {
    case "credited":
      return "Credited. The creator's wallet is updated.";
    case "already-credited":
      return "Already credited.";
    case "not-paid":
      return `Not paid on Paystack (status: ${r.paystackStatus ?? "unknown"}). Leave it, or refund if the reader was charged.`;
    case "amount-mismatch":
      return `Paystack charged ${naira(r.charged)}, less than the ${naira(r.expected)} tip. Investigate before crediting.`;
    case "unknown-tip":
      return "No matching tip in the database.";
    case "error":
      return r.message;
  }
}

export default function TipReconcileList({ items }: { items: StuckTip[] }) {
  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function check(reference: string) {
    setBusy(reference);
    const res = await fetch("/api/admin/tips/reconcile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });
    const data = await res.json().catch(() => null);
    setBusy(null);
    setResults((prev) => ({
      ...prev,
      [reference]: describe(res.ok && data ? data : { error: data?.error ?? "Check failed" }),
    }));
  }

  async function checkAll() {
    for (const item of items) {
      await check(item.reference);
    }
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-app-text/60 dark:text-app-text-dark/60">
        No stuck tips. Every tip older than five minutes has been recorded.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={checkAll}
        disabled={busy !== null}
        className="rounded-full bg-app-primary dark:bg-app-primary-dark px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Check all with Paystack
      </button>

      {items.map((item) => (
        <div
          key={item.reference}
          className="rounded-2xl border border-black/5 bg-app-surface p-4 dark:border-white/10 dark:bg-app-surface-dark"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
              {item.tipper} → {item.recipient}
            </p>
            <p className="text-sm text-app-text dark:text-app-text-dark">
              {naira(item.amountKobo)}
            </p>
          </div>
          <p className="mt-1 break-all text-xs text-app-text/50 dark:text-app-text-dark/50">
            {item.reference}
          </p>
          <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
            {new Date(item.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}
          </p>

          <div className="mt-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => check(item.reference)}
              disabled={busy !== null}
              className="text-xs font-medium text-app-primary dark:text-app-primary-dark disabled:opacity-50"
            >
              {busy === item.reference ? "Checking…" : "Check with Paystack"}
            </button>
            {results[item.reference] && (
              <p className="text-right text-xs text-app-text/70 dark:text-app-text-dark/70">
                {results[item.reference]}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}