import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ThemeToggle from "@/components/ThemeToggle";

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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            {user.username}
            {user.isVerified && (
              <span className="ml-1 inline-block w-4 h-4 rounded-full bg-app-verified dark:bg-app-verified-dark align-middle" />
            )}
          </h1>
          <ThemeToggle />
        </div>
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          {user.bio || "No bio yet"}
        </p>
      </div>
    </main>
  );
}
