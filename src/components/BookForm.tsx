"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { MAX_TAGS, MAX_TAG_LENGTH } from "@/lib/bookFields";

type BookValues = {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  status: "ONGOING" | "COMPLETE";
  isMature: boolean;
  tags: string[];
  coverUrl: string | null;
};

type Props = { mode: "create" } | { mode: "edit"; book: BookValues };

const fieldClass =
  "w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm text-app-text dark:text-app-text-dark focus:outline-none focus:ring-2 focus:ring-app-primary dark:focus:ring-app-primary-dark";
const labelClass =
  "block text-xs uppercase tracking-wide mb-1 text-app-text/50 dark:text-app-text-dark/50";

// "Fantasy, #magic" → ["fantasy", "magic"]
function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/^#+/, "").slice(0, MAX_TAG_LENGTH))
    .filter((t) => t.length >= 2);
}

export default function BookForm(props: Props) {
  const router = useRouter();
  const book = props.mode === "edit" ? props.book : null;
  const isCreate = props.mode === "create";

  const [title, setTitle] = useState(book?.title ?? "");
  const [genre, setGenre] = useState(book?.genre ?? "");
  const [description, setDescription] = useState(book?.description ?? "");
  const [status, setStatus] = useState<"ONGOING" | "COMPLETE">(book?.status ?? "ONGOING");
  const [isMature, setIsMature] = useState(book?.isMature ?? false);
  const [tags, setTags] = useState<string[]>(book?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(book?.coverUrl ?? null);
  const [error, setError] = useState("");
  const [savedBookId, setSavedBookId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addTagsFromInput() {
    const incoming = parseTags(tagInput);
    if (incoming.length) {
      setTags((prev) => {
        const next = [...prev];
        for (const t of incoming) {
          if (!next.includes(t) && next.length < MAX_TAGS) next.push(t);
        }
        return next;
      });
    }
    setTagInput("");
  }

  function onTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagsFromInput();
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function onCoverChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    // Keep any tag still sitting in the input box.
    const finalTags = [...tags];
    for (const t of parseTags(tagInput)) {
      if (!finalTags.includes(t) && finalTags.length < MAX_TAGS) finalTags.push(t);
    }

    const res = await fetch(isCreate ? "/api/books" : `/api/books/${book!.id}`, {
      method: isCreate ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, description, status, isMature, tags: finalTags }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setError(data?.error ?? "Couldn't save the book");
      setSubmitting(false);
      return;
    }

    const bookId: string = isCreate ? data.id : book!.id;
    setSavedBookId(bookId);

    if (coverFile) {
      const fd = new FormData();
      fd.append("cover", coverFile);
      const coverRes = await fetch(`/api/books/${bookId}/cover`, { method: "POST", body: fd });
      if (!coverRes.ok) {
        const cd = await coverRes.json().catch(() => null);
        setError(`Details saved, but the cover didn't upload: ${cd?.error ?? "unknown error"}`);
        setSubmitting(false);
        return;
      }
    }

    router.push(`/books/${bookId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-app-surface dark:bg-app-surface-dark border border-black/5 dark:border-white/10 rounded-2xl p-5 space-y-5"
    >
      {error && (
        <div className="space-y-1">
          <p className="text-sm text-red-600">{error}</p>
          {savedBookId && (
            <Link
              href={`/books/${savedBookId}/edit`}
              className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              Open book settings to retry the cover
            </Link>
          )}
        </div>
      )}

      {/* Cover */}
      <div className="flex items-start gap-4">
        <div className="w-24 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 flex items-center justify-center">
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverPreview} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-app-text/40 dark:text-app-text-dark/40 text-center px-2">
              No cover
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="inline-block cursor-pointer rounded-full border border-black/10 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-app-text dark:text-app-text-dark">
            {coverPreview ? "Change cover" : "Upload cover"}
            <input type="file" accept="image/*" onChange={onCoverChange} className="hidden" />
          </label>
          <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
            JPG or PNG, up to 2MB. Shown on your book and in listings.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>Title</label>
        <input
          id="title"
          type="text"
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="genre" className={labelClass}>Genre</label>
          <input
            id="genre"
            type="text"
            maxLength={60}
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="status" className={labelClass}>Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as "ONGOING" | "COMPLETE")}
            className={fieldClass}
          >
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETE">Complete</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          rows={4}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="tagInput" className={labelClass}>Tags</label>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-black/10 dark:border-white/10 px-2 py-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-app-primary/10 dark:bg-app-primary-dark/15 px-2.5 py-0.5 text-xs text-app-primary dark:text-app-primary-dark"
            >
              #{tag}
              <button
                type="button"
                onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                aria-label={`Remove ${tag}`}
                className="opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="tagInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={addTagsFromInput}
            disabled={tags.length >= MAX_TAGS}
            placeholder={tags.length >= MAX_TAGS ? "Tag limit reached" : "Type a tag, press Enter"}
            className="flex-1 min-w-[8rem] bg-transparent px-1 py-1 text-sm text-app-text dark:text-app-text-dark focus:outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-app-text/50 dark:text-app-text-dark/50">
          {tags.length}/{MAX_TAGS} tags. Use genre, audience, and themes.
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-app-text dark:text-app-text-dark">Mature content</p>
          <p className="text-xs text-app-text/50 dark:text-app-text-dark/50">
            Shows an 18+ label on this book. Use it for violence, sexual content, or strong language.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isMature}
          onClick={() => setIsMature((v) => !v)}
          className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${
            isMature
              ? "bg-app-primary dark:bg-app-primary-dark"
              : "bg-black/15 dark:bg-white/20"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              isMature ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-app-primary dark:bg-app-primary-dark text-white py-2 text-sm font-medium disabled:opacity-60"
      >
        {submitting ? "Saving…" : isCreate ? "Create book" : "Save changes"}
      </button>
    </form>
  );
}