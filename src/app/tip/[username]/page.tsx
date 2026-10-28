import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TipForm from "./TipForm";

export const dynamic = "force-dynamic";

export default async function TipPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ paid?: string; failed?: string }>;
}) {
  const { username } = await params;
  const { paid, failed } = await searchParams;
  const session = await auth();

  const recipient = await prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      isPaymentEligible: true,
      flutterwaveSubaccountId: true,
    },
  });
  if (!recipient) notFound();

  const canReceive =
    recipient.isPaymentEligible && !!recipient.flutterwaveSubaccountId;

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="max-w-sm mx-auto space-y-5">
        <Link
          href={`/u/${recipient.username}`}
          className="text-sm text-app-text/60 dark:text-app-text-dark/60 underline underline-offset-2"
        >
          ← {recipient.username}
        </Link>

        <h1 className="text-xl font-medium text-app-text dark:text-app-text-dark">
          Tip {recipient.username}
        </h1>

        {paid && (
          <p className="text-sm text-app-primary dark:text-app-primary-dark">
            Thanks — your tip went through.
          </p>
        )}
        {failed && (
          <p className="text-sm text-red-600">
            The payment didn&rsquo;t complete. Nothing was charged to your
            tip.
          </p>
        )}

        {!canReceive ? (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            This creator isn&rsquo;t set up to receive tips yet.
          </p>
        ) : !session?.user ? (
          <p className="text-sm text-app-text/70 dark:text-app-text-dark/70">
            <Link
              href="/login"
              className="text-app-primary dark:text-app-primary-dark underline underline-offset-2"
            >
              Log in
            </Link>{" "}
            to send a tip.
          </p>
        ) : (
          <TipForm username={recipient.username} />
        )}
      </div>
    </main>
  );
}
