"use client";

import { useState, type FormEvent } from "react";

const PRESETS = [500, 1000, 2000, 5000];

export default function TipForm({ username }: { username: string }) {
  const [amount, setAmount] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const value = custom.trim() ? Number(custom) : amount;
    setSubmitting(true);

    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, amountNgn: value }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.link) {
      setError(data?.error ?? "Couldn't start the payment");
      setSubmitting(false);
      return;
    }

    // Hand off to Flutterwave's hosted checkout.
    window.location.href = data.link;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-4"
    >
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setAmount(p);
              setCustom("");
            }}
            className={`rounded-full border px-2 py-2 text-sm ${
              !custom && amount === p
                ? "border-app-primary dark:border-app-primary-dark text-app-primary dark:text-app-primary-dark"
                : "border-black/10 dark:border-white/15 text-app-text dark:text-app-text-dark"
            }`}
          >
            ₦{p.toLocaleString()}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="custom"
          className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
        >
          Or enter an amount (₦100–₦50,000)
        </label>
        <input
          id="custom"
          type="number"
          min={100}
          max={50000}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60"
      >
        {submitting ? "Opening checkout…" : "Continue to payment"}
      </button>
    </form>
  );
}
