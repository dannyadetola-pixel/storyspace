"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const router = useRouter();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Choose an image first");
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", caption);

    const res = await fetch("/api/posts", { method: "POST", body: formData });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push("/feed");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          New post
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label
            htmlFor="image"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Image (max 4MB)
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="w-full text-sm text-app-text dark:text-app-text-dark"
          />
        </div>

        <div>
          <label
            htmlFor="caption"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Caption (optional)
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Posting…" : "Post"}
        </button>
      </form>
    </main>
  );
}
