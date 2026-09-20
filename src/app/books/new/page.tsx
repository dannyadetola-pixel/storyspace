import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import NewBookForm from "./NewBookForm";

export default async function NewBookPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <NewBookForm />;
}
