import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createSubaccount, resolveAccount } from "@/lib/paystack";
import { notify } from "@/lib/notify";

// Every word the applicant typed must appear in the name the bank returns.
// This catches typos and mismatched accounts before a subaccount is created.
function namesMatch(typed: string, resolved: string): boolean {
  const words = (s: string) =>
    s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 0);
  const bankWords = new Set(words(resolved));
  return words(typed).every((w) => bankWords.has(w));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await params;
  const { decision } = await req.json();
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const request = await prisma.paymentEligibilityRequest.findUnique({
    where: { id },
  });
  if (!request) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (decision === "reject") {
    await prisma.paymentEligibilityRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  }

  if (!request.accountName || !request.bankAccountNo || !request.bankCode) {
    return NextResponse.json(
      { error: "Request is missing required details" },
      { status: 400 }
    );
  }

  try {
    // Confirm the account exists and belongs to the applicant before creating
    // anything on Paystack.
    const bankName = await resolveAccount(request.bankAccountNo, request.bankCode);
    if (!namesMatch(request.accountName, bankName)) {
      return NextResponse.json(
        {
          error: `The bank returned "${bankName}", which doesn't match "${request.accountName}". Check with the applicant before approving.`,
        },
        { status: 400 }
      );
    }

    const subaccountCode = await createSubaccount({
      businessName: request.accountName,
      bankCode: request.bankCode,
      accountNumber: request.bankAccountNo,
    });

    await prisma.user.update({
      where: { id: request.userId },
      data: { isPaymentEligible: true, paystackSubaccountCode: subaccountCode },
    });

    await prisma.paymentEligibilityRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    await notify({
      userId: request.userId,
      type: "PAYMENT_APPROVED",
      message: "You're approved to receive payments",
      link: "/wallet",
    });

    return NextResponse.json({ ok: true, subaccountCode });
  } catch (err) {
    console.error("Approving payment eligibility (Paystack) failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Paystack rejected the request" },
      { status: 500 }
    );
  }
}
