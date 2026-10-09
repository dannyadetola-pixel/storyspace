import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import NewPostForm from "./NewPostForm";

export default async function NewPostPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <NewPostForm />;
}
