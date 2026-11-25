"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS: { href: string; label: string; icon: ReactNode }[] = [
  { href: "/", label: "Home", icon: <path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" /> },
  {
    href: "/explore",
    label: "Explore",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
  },
  {
    href: "/library",
    label: "Library",
    icon: (
      <>
        <path d="M4 4h4v16H4z" />
        <path d="M10 4h4v16h-4z" />
        <path d="m16 5 4 1-3 14-4-1z" />
      </>
    ),
  },
  { href: "/chats", label: "Chats", icon: <path d="M4 5h16v11H9l-5 4z" /> },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
  },
];

// Bottom tab bar for phones. Signed-in users only; hidden on desktop.
export default function BottomNav() {
  const pathname = usePathname();

  // A chat screen has its own message box at the bottom, so the bar steps aside.
  if (pathname.startsWith("/chats/") && pathname !== "/chats/new-group") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-app-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10 dark:bg-app-surface-dark/95 md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
                  active
                    ? "text-app-primary dark:text-app-primary-dark"
                    : "text-app-text/60 dark:text-app-text-dark/60"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {tab.icon}
                </svg>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}