import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const session = await auth();

  const navLinks = (
    <>
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
      <Link
        href="/explore"
        className="hover:text-app-text dark:hover:text-app-text-dark"
      >
        Explore
      </Link>
      {session?.user ? (
        <>
          <Link
            href="/chats"
            className="hover:text-app-text dark:hover:text-app-text-dark"
          >
            Chats
          </Link>
          <Link
            href="/profile"
            className="hover:text-app-text dark:hover:text-app-text-dark"
          >
            Profile
          </Link>
          {isAdmin(session) && (
            <Link
              href="/admin"
              className="hover:text-app-text dark:hover:text-app-text-dark"
            >
              Admin
            </Link>
          )}
          <LogoutButton />
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
    </>
  );

  return (
    <header className="relative border-b border-black/5 dark:border-white/10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-medium text-app-primary dark:text-app-primary-dark"
        >
          StorySpace
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-app-text/70 dark:text-app-text-dark/70">
          {navLinks}
        </nav>

        <MobileNav>
          <div className="flex flex-col gap-4 text-app-text/70 dark:text-app-text-dark/70">
            {navLinks}
          </div>
        </MobileNav>
      </div>
    </header>
  );
}
