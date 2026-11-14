import Link from "next/link";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import ThemeToggle from "./ThemeToggle";
import MobileNav from "./MobileNav";
import LogoutButton from "./LogoutButton";
import NotificationBell from "./NotificationBell";

export default async function Header() {
  const session = await auth();
  const signedIn = !!session?.user;

  // Signed-out visitors see the fixed dark landing page, so the header is dark
  // too. Signed-in users get the normal themed header.
  const linkClass = signedIn
    ? "hover:text-app-text dark:hover:text-app-text-dark"
    : "hover:text-white";
  const navTone = signedIn
    ? "text-app-text/70 dark:text-app-text-dark/70"
    : "text-white/70";
  const headerClass = signedIn
    ? "relative border-b border-black/5 dark:border-white/10"
    : "relative border-b border-white/10 bg-[#000000] text-white";
  // The mobile dropdown has its own padding, so the dark version extends the
  // background into it with negative margins.
  const mobileWrap = signedIn
    ? "flex flex-col gap-4 text-app-text/70 dark:text-app-text-dark/70"
    : "-mx-4 -my-4 flex flex-col gap-4 bg-[#000000] px-4 py-4 text-white/70";

  const navLinks = (
    <>
      <Link href="/books" className={linkClass}>
        Books
      </Link>
      <Link href="/explore" className={linkClass}>
        Explore
      </Link>
      {signedIn ? (
        <>
          <Link href="/chats" className={linkClass}>
            Chats
          </Link>
          <Link href="/wallet" className={linkClass}>
            Wallet
          </Link>
          <Link href="/profile" className={linkClass}>
            Profile
          </Link>
          {isAdmin(session) && (
            <Link href="/admin" className={linkClass}>
              Admin
            </Link>
          )}
          <LogoutButton />
        </>
      ) : (
        <Link href="/login" className={linkClass}>
          Log in
        </Link>
      )}
      {/* The theme toggle is offered to signed-in users only. */}
      {signedIn && <ThemeToggle />}
    </>
  );

  return (
    <header className={headerClass}>
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-medium text-app-primary dark:text-app-primary-dark"
        >
          StorySpace
        </Link>

        <div className="flex items-center gap-2">
          <nav
            className={`hidden md:flex items-center gap-5 text-sm ${navTone}`}
          >
            {navLinks}
          </nav>

          <MobileNav>
            <div className={mobileWrap}>{navLinks}</div>
          </MobileNav>

          {/* The bell comes last: after the theme toggle on desktop, and after
              the menu button on mobile. It's rendered once, so it polls once. */}
          {signedIn && <NotificationBell />}
        </div>
      </div>
    </header>
  );
}