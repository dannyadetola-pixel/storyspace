"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function NewGroupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function addMember() {
    const trimmed = memberInput.trim();
    if (trimmed && !members.includes(trimmed)) {
      setMembers((prev) => [...prev, trimmed]);
    }
    setMemberInput("");
  }

  function removeMember(username: string) {
    setMembers((prev) => prev.filter((m) => m !== username));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || members.length === 0 || submitting) return;
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/conversations/group", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, usernames: members }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Couldn't create that group");
      setSubmitting(false);
      return;
    }

    const { id } = await res.json();
    router.push(`/chats/${id}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-app-surface dark:bg-app-surface-dark rounded-2xl p-8 space-y-4"
      >
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          New group
        </h1>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label
            htmlFor="name"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Group name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
          />
        </div>

        <div>
          <label
            htmlFor="member"
            className="block text-sm mb-1 text-app-text/70 dark:text-app-text-dark/70"
          >
            Add members by username
          </label>
          <div className="flex gap-2">
            <input
              id="member"
              type="text"
              value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMember();
                }
              }}
              placeholder="username"
              className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark"
            />
            <button
              type="button"
              onClick={addMember}
              className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-sm font-medium text-app-text dark:text-app-text-dark"
            >
              Add
            </button>
          </div>

          {members.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {members.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs text-app-text dark:text-app-text-dark"
                >
                  {m}
                  <button
                    type="button"
                    onClick={() => removeMember(m)}
                    aria-label={`Remove ${m}`}
                    className="text-app-text/50 dark:text-app-text-dark/50"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !name.trim() || members.length === 0}
          className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 font-medium disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Create group"}
        </button>
      </form>
    </main>
  );
}
