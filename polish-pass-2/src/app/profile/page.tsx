import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-sm mx-auto space-y-3">
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          {user.username}
          {user.isVerified && (
            <span
              aria-hidden="true"
              className="ml-1 inline-block w-4 h-4 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle"
            />
          )}
        </h1>
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          {user.bio || "No bio yet"}
        </p>
        <Link
          href="/books/new"
          className="inline-block pt-1 text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
        >
          Start a new book
        </Link>
      </div>
    </main>
  );
}
