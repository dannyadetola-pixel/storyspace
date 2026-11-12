"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

// Lets a group admin change the group photo. Renders as a small text button.
export default function GroupAvatarUpload({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError("");
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch(`/api/conversations/${conversationId}/avatar`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);

    setBusy(false);
    e.target.value = "";
    if (!res.ok) {
      setError(data?.error ?? "Couldn't upload that photo");
      return;
    }
    router.refresh();
  }

  return (
    <label className="inline-block cursor-pointer text-xs font-medium text-app-primary dark:text-app-primary-dark">
      {busy ? "Uploading…" : "Change group photo"}
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        disabled={busy}
        className="hidden"
      />
      {error && <span className="ml-2 text-red-600">{error}</span>}
    </label>
  );
}
