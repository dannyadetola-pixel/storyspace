import Link from "next/link";
import type { ReactNode } from "react";
import LoginPanel from "@/components/LoginPanel";

// Instagram-style signed-out page, fixed dark in both panels. The brand panel
// on the left has doodles behind the content. The login panel on the right
// sits on the same dark background. On small screens the brand panel hides.
const collage = [
  { src: "/hero/1.jpg", className: "left-0 top-12 w-40 h-56 -rotate-6" },
  { src: "/hero/3.jpg", className: "left-16 top-0 w-44 h-64" },
  { src: "/hero/4.jpg", className: "right-0 top-14 w-40 h-56 rotate-6" },
];

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

const doodleShapes: Record<DoodleName, ReactNode> = {
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

const doodles: {
  name: DoodleName;
  top: string;
  left: string;
  size: number;
  rotate: number;
  tone: string;
}[] = [
  { name: "book", top: "6%", left: "6%", size: 56, rotate: -12, tone: "text-white/20" },
  { name: "chat", top: "4%", left: "40%", size: 44, rotate: 10, tone: "text-app-primary/60" },
  { name: "heart", top: "14%", left: "78%", size: 40, rotate: 14, tone: "text-app-secondary/60" },
  { name: "share", top: "28%", left: "14%", size: 36, rotate: -8, tone: "text-white/20" },
  { name: "camera", top: "24%", left: "82%", size: 48, rotate: 6, tone: "text-white/20" },
  { name: "banknote", top: "40%", left: "4%", size: 52, rotate: 10, tone: "text-app-secondary/60" },
  { name: "wallet", top: "36%", left: "88%", size: 46, rotate: -10, tone: "text-app-secondary/60" },
  { name: "naira", top: "56%", left: "10%", size: 42, rotate: 8, tone: "text-app-primary/60" },
  { name: "chat", top: "62%", left: "84%", size: 40, rotate: -6, tone: "text-white/20" },
  { name: "book", top: "78%", left: "16%", size: 50, rotate: 8, tone: "text-white/20" },
  { name: "heart", top: "84%", left: "70%", size: 36, rotate: -12, tone: "text-app-primary/60" },
  { name: "banknote", top: "90%", left: "40%", size: 48, rotate: -6, tone: "text-app-secondary/60" },
  { name: "share", top: "72%", left: "52%", size: 30, rotate: 12, tone: "text-white/20" },
  { name: "coin", top: "12%", left: "62%", size: 34, rotate: 0, tone: "text-app-secondary/50" },
];

function BrandDoodles() {
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
          {doodleShapes[d.name]}
        </svg>
      ))}
    </div>
  );
}

export default function MarketingHero() {
  return (
    <section className="grid min-h-[calc(100vh-3.5rem)] md:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col overflow-hidden bg-[#0d1a14] text-white md:flex">
        <BrandDoodles />

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="p-8">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-app-primary">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 5.5 C7 4 10 4 12 6 C14 4 17 4 20 5.5 V19 C17 17.5 14 17.5 12 19 C10 17.5 7 17.5 4 19 Z" />
                  <path d="M12 6 V19" />
                </svg>
              </span>
              <span className="text-lg font-semibold">StorySpace</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <h2 className="max-w-md text-4xl font-medium leading-snug">
              Books, community, and{" "}
              <span className="bg-gradient-to-r from-app-primary to-app-secondary bg-clip-text text-transparent">
                creators
              </span>{" "}
              — all in one place
            </h2>

            <div className="relative mt-12 h-72 w-72">
              {collage.map((photo) => (
                <div
                  key={photo.src}
                  aria-hidden="true"
                  className={`absolute overflow-hidden rounded-2xl shadow-2xl ${photo.className}`}
                  style={{
                    backgroundImage: `url('${photo.src}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
              <div className="absolute bottom-4 left-6 rounded-full bg-white px-3 py-1 text-xs font-medium text-black shadow-lg">
                ♥ 24
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login panel: fixed dark, matching the brand panel */}
      <div className="flex flex-col items-center justify-center bg-[#181818] px-6 py-12 text-white">
        <div className="w-full max-w-sm">
          <LoginPanel />
        </div>

        <p className="mt-10 space-x-3 text-center text-xs text-white/50">
          <Link href="/feed" className="hover:underline">Feed</Link>
          <Link href="/books" className="hover:underline">Books</Link>
          <Link href="/explore" className="hover:underline">Explore</Link>
        </p>
      </div>
    </section>
  );
}
