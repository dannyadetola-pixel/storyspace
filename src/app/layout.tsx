import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import PwaRegister from "@/components/PwaRegister";

// Self-hosted at build time by Next.js — no separate font-loading setup needed.
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const metadata: Metadata = {
  title: "StorySpace",
  description: "Books, community, and creators in one place.",
  // The manifest is generated from src/app/manifest.ts.
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

// Next.js takes the theme colour from this export, not from metadata.
export const viewport: Viewport = {
  themeColor: "#1b7d00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lora.variable}>
      <body className="bg-app-bg dark:bg-app-bg-dark min-h-screen">
        <Header />
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}