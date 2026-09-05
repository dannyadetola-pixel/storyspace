import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="bg-app-bg dark:bg-app-bg-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
