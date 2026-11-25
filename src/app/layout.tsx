import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PwaRegister from "@/components/PwaRegister";

// Self-hosted at build time by Next.js — no separate font-loading setup needed.
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "StorySpace",
  description: "Books, community, and creators in one place.",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    title: "StorySpace",
    statusBarStyle: "black-translucent",
  },
};

// Next.js takes the theme colour and viewport settings from this export.
export const viewport: Viewport = {
  themeColor: "#1b7d00",
  viewportFit: "cover", // lets the page reach the screen edges, behind the notch
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const signedIn = !!session?.user;

  return (
    <html lang="en" className={lora.variable}>
      <body
        className={`bg-app-bg dark:bg-app-bg-dark min-h-screen ${
          signedIn ? "pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0" : ""
        }`}
      >
        <Header />
        {children}
        {signedIn && <BottomNav />}
        <PwaRegister />
      </body>
    </html>
  );
}