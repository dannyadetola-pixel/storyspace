"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const CREATOR_OPTIONS = [
  { value: "books", label: "Books and stories" },
  { value: "photos", label: "Photos and posts" },
  { value: "videos", label: "Videos and reels" },
  { value: "other", label: "Something else" },
];

const fieldClass =
  "w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark";

const labelClass =
  "block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70";

export default function VerifyForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [creatorType, setCreatorType] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [sampleLink, setSampleLink] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/verification-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        creatorType,
        externalLink,
        sampleLink,
        additionalInfo,
      }),
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
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Request verification
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full legal name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="creatorType" className={labelClass}>
            What do you create?
          </label>
          <select
            id="creatorType"
            value={creatorType}
            onChange={(e) => setCreatorType(e.target.value)}
            required
            className={fieldClass}
          >
            <option value="" disabled>
              Choose one
            </option>
            {CREATOR_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="externalLink" className={labelClass}>
            Link to an external profile
          </label>
          <input
            id="externalLink"
            type="url"
            placeholder="https://"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            required
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-app-text/50 dark:text-app-text-dark/50">
            Wattpad, Instagram, a personal website, or anywhere else your work appears.
          </p>
        </div>

        <div>
          <label htmlFor="sampleLink" className={labelClass}>
            Link to a sample of your work
          </label>
          <input
            id="sampleLink"
            type="url"
            placeholder="https://"
            value={sampleLink}
            onChange={(e) => setSampleLink(e.target.value)}
            required
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-app-text/50 dark:text-app-text-dark/50">
            A published piece, or a chapter on StorySpace.
          </p>
        </div>

        <div>
          <label htmlFor="additionalInfo" className={labelClass}>
            Add more information (optional)
          </label>
          <textarea
            id="additionalInfo"
            rows={3}
            maxLength={500}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            className={fieldClass}
          />
        </div>

        <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
          Your name and links are used only to review this request.
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