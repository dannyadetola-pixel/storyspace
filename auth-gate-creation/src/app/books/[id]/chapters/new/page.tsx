import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewChapterForm from "./NewChapterForm";

export default async function NewChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) notFound();
  // Not just "logged in" — only the book's own author belongs on this page.
  if (book.userId !== session.user.id) redirect(`/books/${id}`);

  return <NewChapterForm />;
}
