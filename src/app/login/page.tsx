import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import MarketingHero from "@/components/MarketingHero";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return <MarketingHero />;
}