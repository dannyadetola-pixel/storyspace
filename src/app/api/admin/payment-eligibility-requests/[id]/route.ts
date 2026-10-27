import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { createFlutterwaveSubaccount } from "@/lib/flutterwave";

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
    include: { user: { select: { email: true } } },
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

  // Approving: create the real payout destination FIRST. If Flutterwave
  // rejects this (bad bank details, etc.), the request simply stays
  // pending with a clear error — never flagged "approved" without an
  // actual account behind it to receive money.
  if (
    !request.accountName ||
    !request.bankAccountNo ||
    !request.bankCode ||
    !request.phoneNumber
  ) {
    return NextResponse.json(
      { error: "Request is missing required details" },
      { status: 400 }
    );
  }

  try {
    const { subaccountId } = await createFlutterwaveSubaccount({
      accountBank: request.bankCode,
      accountNumber: request.bankAccountNo,
      businessName: request.accountName,
      businessMobile: request.phoneNumber,
      businessEmail: request.user.email,
    });

    await prisma.user.update({
      where: { id: request.userId },
      data: { isPaymentEligible: true, flutterwaveSubaccountId: subaccountId },
    });

    await prisma.paymentEligibilityRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    });

    return NextResponse.json({ ok: true, subaccountId });
  } catch (err) {
    console.error("Approving payment eligibility (Flutterwave) failed:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Flutterwave rejected the subaccount request",
      },
      { status: 500 }
    );
  }
}
