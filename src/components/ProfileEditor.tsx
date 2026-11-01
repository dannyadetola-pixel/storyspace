"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ProfileEditor({
  initialName,
  initialBio,
}: {
  initialName: string;
  initialBio: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Couldn't save your profile");
      return;
    }
    setMessage("Profile saved");
    router.refresh();
  }

  async function handleAvatar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);

    setUploading(false);
    e.target.value = "";
    if (!res.ok) {
      setError(data?.error ?? "Couldn't upload that image");
      return;
    }
    setMessage("Profile picture updated");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-app-text dark:text-app-text-dark">
          Profile picture
        </p>
        <label className="cursor-pointer rounded-full border border-black/10 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-app-text dark:text-app-text-dark">
          {uploading ? "Uploading…" : "Change"}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-xs uppercase tracking-wide mb-1 text-app-text/50 dark:text-app-text-dark/50"
          >
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-xs uppercase tracking-wide mb-1 text-app-text/50 dark:text-app-text-dark/50"
          >
            Bio
          </label>
          <textarea
            id="bio"
            maxLength={300}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
          <p className="mt-1 text-xs text-app-text/40 dark:text-app-text-dark/40">
            {bio.length}/300
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && (
          <p className="text-sm text-app-primary dark:text-app-primary-dark">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 text-sm font-medium disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}