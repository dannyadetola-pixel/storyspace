import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by Next.js — no separate font-loading setup needed.
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  // Placeholder — swap for the app's real name once you've picked one.
  title: "StorySpace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="bg-app-bg dark:bg-app-bg-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
