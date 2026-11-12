import type { ReactNode } from "react";

// The same doodle set as the landing page, in softer tones so the chat stays
// readable on cream (light mode) and black (dark mode).
type DoodleName =
  | "book"
  | "chat"
  | "heart"
  | "share"
  | "camera"
  | "banknote"
  | "wallet"
  | "naira"
  | "coin";

const shapes: Record<DoodleName, ReactNode> = {
  book: (
    <>
      <path d="M2 5 C5 3.5 8.5 3.5 12 6 C15.5 3.5 19 3.5 22 5 V19 C19 17.5 15.5 17.5 12 19.5 C8.5 17.5 5 17.5 2 19 Z" />
      <path d="M12 6 V19.5" />
    </>
  ),
  chat: (
    <path d="M4 5 H20 C21 5 22 6 22 7 V16 C22 17 21 18 20 18 H10 L6 21 V18 H4 C3 18 2 17 2 16 V7 C2 6 3 5 4 5 Z" />
  ),
  heart: (
    <path d="M12 20 C5 15 2 11 2 7.5 C2 4.5 4.5 3 7 3 C9 3 11 4.2 12 6 C13 4.2 15 3 17 3 C19.5 3 22 4.5 22 7.5 C22 11 19 15 12 20 Z" />
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 13.2 L15.8 17.8 M15.8 6.2 L8.2 10.8" />
    </>
  ),
  camera: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="3" />
      <circle cx="12" cy="13.5" r="3.5" />
      <path d="M8 7 L9.5 4.5 H14.5 L16 7" />
    </>
  ),
  banknote: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 8 V6 C3 5 4 4 5 4 H17 V8" />
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <circle cx="16.5" cy="14" r="1" />
    </>
  ),
  naira: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 16 V8 L15.5 16 V8 M7.5 11 H16.5 M7.5 13.5 H16.5" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
    </>
  ),
};

const PRIMARY = "text-app-primary/25";
const SECONDARY = "text-app-secondary/25";
const NEUTRAL = "text-app-text/10 dark:text-white/10";

const doodles: {
  name: DoodleName;
  top: string;
  left: string;
  size: number;
  rotate: number;
  tone: string;
}[] = [
  { name: "book", top: "5%", left: "6%", size: 52, rotate: -12, tone: NEUTRAL },
  { name: "chat", top: "3%", left: "42%", size: 40, rotate: 10, tone: PRIMARY },
  { name: "heart", top: "12%", left: "80%", size: 38, rotate: 14, tone: SECONDARY },
  { name: "share", top: "26%", left: "12%", size: 34, rotate: -8, tone: NEUTRAL },
  { name: "camera", top: "22%", left: "84%", size: 44, rotate: 6, tone: NEUTRAL },
  { name: "banknote", top: "42%", left: "4%", size: 46, rotate: 10, tone: SECONDARY },
  { name: "wallet", top: "38%", left: "88%", size: 42, rotate: -10, tone: SECONDARY },
  { name: "naira", top: "58%", left: "10%", size: 40, rotate: 8, tone: PRIMARY },
  { name: "chat", top: "64%", left: "84%", size: 38, rotate: -6, tone: NEUTRAL },
  { name: "book", top: "80%", left: "14%", size: 46, rotate: 8, tone: NEUTRAL },
  { name: "heart", top: "86%", left: "72%", size: 34, rotate: -12, tone: PRIMARY },
  { name: "banknote", top: "92%", left: "42%", size: 44, rotate: -6, tone: SECONDARY },
  { name: "share", top: "74%", left: "54%", size: 28, rotate: 12, tone: NEUTRAL },
  { name: "coin", top: "14%", left: "62%", size: 32, rotate: 0, tone: SECONDARY },
];

export default function ChatDoodles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {doodles.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`absolute ${d.tone}`}
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            transform: `rotate(${d.rotate}deg)`,
          }}
        >
          {shapes[d.name]}
        </svg>
      ))}
    </div>
  );
}
