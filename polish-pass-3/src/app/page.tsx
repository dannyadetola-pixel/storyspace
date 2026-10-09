import Link from "next/link";

export default function Home() {
  return (
    <main className="relative overflow-hidden flex flex-col items-center justify-center px-4 py-24 text-center min-h-[calc(100vh-3.5rem)]">
      {/* Purely decorative — hidden from screen readers, sits behind the content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-app-primary/10 dark:bg-app-primary-dark/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-16 w-96 h-96 rounded-full bg-app-secondary/10 dark:bg-app-secondary-dark/10 blur-3xl" />

        {/* Open book — represents the writing/reading side */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute top-[14%] left-[8%] w-20 h-20 text-app-primary/[0.12] dark:text-app-primary-dark/20 -rotate-6"
        >
          <path d="M32 14 C25 10 15 10 9 14 V48 C15 44 25 44 32 48 C39 44 49 44 55 48 V14 C49 10 39 10 32 14 Z" />
          <path d="M32 14 V48" />
        </svg>

        {/* Chat bubble — the messaging side */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute bottom-[20%] right-[10%] w-16 h-16 text-app-secondary/[0.16] dark:text-app-secondary-dark/25 rotate-6"
        >
          <path d="M8 14 H56 C58 14 60 16 60 18 V40 C60 42 58 44 56 44 H24 L14 54 V44 H8 C6 44 4 42 4 40 V18 C4 16 6 14 8 14 Z" />
          <circle cx="19" cy="29" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="32" cy="29" r="1.6" fill="currentColor" stroke="none" />
          <circle cx="45" cy="29" r="1.6" fill="currentColor" stroke="none" />
        </svg>

        {/* Heart — reactions on posts and chapters */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute top-[20%] right-[16%] w-12 h-12 text-app-primary/[0.12] dark:text-app-primary-dark/20 rotate-12"
        >
          <path d="M32 52 C12 40 6 27 14 18 C20 11 30 12 32 22 C34 12 44 11 50 18 C58 27 52 40 32 52 Z" />
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
