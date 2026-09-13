import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-medium text-app-text dark:text-app-text-dark max-w-lg">
        Stories, posts, and people — all in one place
      </h1>
      <p className="mt-3 max-w-md text-app-text/70 dark:text-app-text-dark/70">
        Write and read serialized stories, share photos and reels, and follow
        the creators you love.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Link
          href="/books"
          className="rounded-full bg-app-primary dark:bg-app-primary-dark text-white px-6 py-2.5 font-medium"
        >
          Start reading
        </Link>
        <Link
          href="/signup"
          className="rounded-full border border-black/10 dark:border-white/15 px-6 py-2.5 font-medium text-app-text dark:text-app-text-dark"
        >
          Create an account
        </Link>
      </div>
    </main>
  );
}
