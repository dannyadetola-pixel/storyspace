import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import EditorPicksManager from "@/components/EditorPicksManager";

export const dynamic = "force-dynamic";

export default async function EditorPicksPage() {
  const session = await auth();
  if (!isAdmin(session)) redirect("/");

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
            Editor picks
          </h1>
          <Link
            href="/admin"
            className="text-sm text-app-primary dark:text-app-primary-dark underline underline-offset-2"
          >
            Back to admin
          </Link>
        </div>
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          Books here appear in &ldquo;Top picks by editors&rdquo; on the
          homepage, in the order they were added.
        </p>
        <EditorPicksManager />
      </div>
    </main>
  );
}
