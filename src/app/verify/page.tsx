import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import VerifyForm from "./VerifyForm";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isVerified: true,
      verificationRequest: { select: { status: true } },
    },
  });

  if (user?.isVerified) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          Your account is already verified.
        </p>
      </main>
    );
  }

  if (user?.verificationRequest?.status === "PENDING") {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
          Your verification request is already pending review.
        </p>
      </main>
    );
  }

  return <VerifyForm />;
}
