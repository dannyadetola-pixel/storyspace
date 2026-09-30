import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import NewGroupForm from "./NewGroupForm";

export default async function NewGroupPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <NewGroupForm />;
}
