import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-medium text-app-text dark:text-app-text-dark">
          Welcome
        </h1>
        <Link
          href="/login"
          className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
