import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import BookForm from "@/components/BookForm";

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Start a new book
        </h1>
        <BookForm mode="create" />
      </div>
    </main>
  );
}