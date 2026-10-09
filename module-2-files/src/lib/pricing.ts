// Chapter unlock price is derived from word count, not set by the author —
// that's deliberate (see the earlier pricing discussion): it's self-regulating
// and can't be used to overcharge for a short chapter. Tune the two constants
// below if the economics need to change; nothing else in the app needs to
// know the formula.

const FREE_WORD_THRESHOLD = 500; // chapters shorter than this are always free
const KOBO_PER_WORD = 4; // roughly ₦1 per 25 words
const ROUND_TO_KOBO = 500; // round to the nearest ₦5

export function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export function calculateChapterPrice(wordCount: number): number {
  if (wordCount < FREE_WORD_THRESHOLD) return 0;
  const raw = wordCount * KOBO_PER_WORD;
  return Math.round(raw / ROUND_TO_KOBO) * ROUND_TO_KOBO;
}
