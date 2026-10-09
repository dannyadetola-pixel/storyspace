import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-black/5 dark:border-white/10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-medium text-app-primary dark:text-app-primary-dark"
        >
          StorySpace
        </Link>

        <nav className="flex items-center gap-5 text-sm text-app-text/70 dark:text-app-text-dark/70">
          <Link
            href="/feed"
            className="hover:text-app-text dark:hover:text-app-text-dark"
          >
            Feed
          </Link>
          <Link
            href="/books"
            className="hover:text-app-text dark:hover:text-app-text-dark"
          >
            Books
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/profile"
                className="hover:text-app-text dark:hover:text-app-text-dark"
              >
                Profile
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="hover:text-app-text dark:hover:text-app-text-dark"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="hover:text-app-text dark:hover:text-app-text-dark"
            >
              Log in
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
