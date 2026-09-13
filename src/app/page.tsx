import Link from "next/link";

// Four line-art shapes representing what the app actually does: writing/
// reading, messaging, reactions, and photo posts. Defined once, reused
// across all 12 placements below so the path data isn't repeated 12 times.
function BookPaths() {
  return (
    <>
      <path d="M32 14 C25 10 15 10 9 14 V48 C15 44 25 44 32 48 C39 44 49 44 55 48 V14 C49 10 39 10 32 14 Z" />
      <path d="M32 14 V48" />
    </>
  );
}

function ChatPaths() {
  return (
    <>
      <path d="M8 14 H56 C58 14 60 16 60 18 V40 C60 42 58 44 56 44 H24 L14 54 V44 H8 C6 44 4 42 4 40 V18 C4 16 6 14 8 14 Z" />
      <circle cx="19" cy="29" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="32" cy="29" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="45" cy="29" r="1.6" fill="currentColor" stroke="none" />
    </>
  );
}

function HeartPaths() {
  return (
    <path d="M32 52 C12 40 6 27 14 18 C20 11 30 12 32 22 C34 12 44 11 50 18 C58 27 52 40 32 52 Z" />
  );
}

function PhotoPaths() {
  return (
    <>
      <rect x="8" y="12" width="48" height="40" rx="4" />
      <circle cx="22" cy="26" r="4" />
      <path d="M8 42 L22 30 L34 40 L44 30 L56 42" />
    </>
  );
}

// Every decorative icon shares these — only className changes per instance.
const iconProps = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function Home() {
  return (
    <main className="relative overflow-hidden flex flex-col items-center justify-center px-4 py-24 text-center min-h-[calc(100vh-3.5rem)]">
      {/* Purely decorative — hidden from screen readers, sits behind the content.
          12 icons: 4 shapes x 3 instances each, in a large/medium/small size
          tier, placed in the four corners, both mid-edges, and a handful of
          faint accents — deliberately kept clear of the centered text column. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-app-primary/10 dark:bg-app-primary-dark/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 w-96 h-96 rounded-full bg-app-secondary/10 dark:bg-app-secondary-dark/10 blur-3xl" />

        {/* — Large tier: one of each shape, anchoring the four corners — */}
        <svg
          {...iconProps}
          className="absolute top-6 left-6 w-24 h-24 text-app-primary/[0.28] dark:text-app-primary-dark/35 rotate-[-8deg]"
        >
          <BookPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute top-8 right-8 w-20 h-20 text-app-secondary/[0.30] dark:text-app-secondary-dark/38 rotate-[9deg]"
        >
          <ChatPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute bottom-10 left-8 w-20 h-20 text-app-secondary/[0.28] dark:text-app-secondary-dark/35 rotate-[-7deg]"
        >
          <PhotoPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute bottom-8 right-10 w-16 h-16 text-app-primary/[0.26] dark:text-app-primary-dark/32 rotate-[12deg]"
        >
          <HeartPaths />
        </svg>

        {/* — Medium tier: the mid-height left/right edges — */}
        <svg
          {...iconProps}
          className="absolute top-[42%] left-5 w-14 h-14 text-app-secondary/[0.24] dark:text-app-secondary-dark/30 rotate-[-10deg]"
        >
          <HeartPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute top-[46%] right-6 w-16 h-16 text-app-primary/[0.26] dark:text-app-primary-dark/32 rotate-[7deg]"
        >
          <PhotoPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute bottom-[24%] left-[30%] w-12 h-12 text-app-primary/[0.22] dark:text-app-primary-dark/28 rotate-[5deg]"
        >
          <BookPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute top-[22%] right-[26%] w-12 h-12 text-app-secondary/[0.22] dark:text-app-secondary-dark/28 rotate-[-11deg]"
        >
          <ChatPaths />
        </svg>

        {/* — Small tier: faint accents filling out the upper/lower thirds — */}
        <svg
          {...iconProps}
          className="absolute top-[12%] left-[26%] w-10 h-10 text-app-primary/[0.18] dark:text-app-primary-dark/24 rotate-[14deg]"
        >
          <PhotoPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute top-[9%] left-[47%] w-8 h-8 text-app-secondary/[0.16] dark:text-app-secondary-dark/22 rotate-[-14deg]"
        >
          <HeartPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute top-[64%] left-11 w-11 h-11 text-app-secondary/[0.20] dark:text-app-secondary-dark/26 rotate-[-15deg]"
        >
          <BookPaths />
        </svg>
        <svg
          {...iconProps}
          className="absolute bottom-[20%] right-[22%] w-11 h-11 text-app-primary/[0.20] dark:text-app-primary-dark/26 rotate-[-12deg]"
        >
          <ChatPaths />
        </svg>
      </div>

      <div className="relative z-10">
        <h1 className="text-3xl font-medium text-app-text dark:text-app-text-dark max-w-lg">
          Stories, posts, and people — all in one place
        </h1>
        <p className="mt-3 max-w-md mx-auto text-app-text/70 dark:text-app-text-dark/70">
          Write and read serialized stories, share photos and reels, and
          follow the creators you love.
        </p>
        <div className="mt-8 flex items-center gap-4 justify-center">
          <Link
            href="/books"
            className="rounded-full bg-app-primary dark:bg-app-primary-dark text-white px-6 py-2.5 font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            Start reading
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-black/10 dark:border-white/15 px-6 py-2.5 font-medium text-app-text dark:text-app-text-dark transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20 dark:hover:border-white/25 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}
