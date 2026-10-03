"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function PaymentEligibilityForm() {
  const router = useRouter();
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/payment-eligibility-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankAccountNo, bankCode }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    router.refresh();
  }

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 text-center space-y-2">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Request submitted
          </h1>
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            We&rsquo;ll review it and let you know.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Request payment eligibility
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label
            htmlFor="bankAccountNo"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Bank account number
          </label>
          <input
            id="bankAccountNo"
            type="text"
            value={bankAccountNo}
            onChange={(e) => setBankAccountNo(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <div>
          <label
            htmlFor="bankCode"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Bank code
          </label>
          <input
            id="bankCode"
            type="text"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
          These details are only used to verify eligibility for payouts once
          the payment system itself is live — reviewed by hand for now.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </main>
  );
}
