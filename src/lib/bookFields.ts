export const MAX_TAGS = 25;
export const MAX_TAG_LENGTH = 40;

// Lowercase, trimmed, no leading #, de-duplicated, capped at MAX_TAGS.
export function normaliseTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const tags = new Set<string>();
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const tag = raw.trim().toLowerCase().replace(/^#+/, "").slice(0, MAX_TAG_LENGTH);
    if (tag.length >= 2) tags.add(tag);
    if (tags.size >= MAX_TAGS) break;
  }
  return [...tags];
}