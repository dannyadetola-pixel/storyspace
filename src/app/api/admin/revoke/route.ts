import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Revokes a user's verification or payment approval. The matching request
// is marked REJECTED, so the user can request again later.
export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { userId, kind } = await req.json();
  if (typeof userId !== "string" || (kind !== "verification" && kind !== "payment")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (kind === "verification") {
    await prisma.user.update({ where: { id: userId }, data: { isVerified: false } });
    await prisma.verificationRequest.updateMany({
      where: { userId, status: "APPROVED" },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });
  } else {
    // Revoking payment eligibility stops new tips routing to this creator.
    // The Flutterwave subaccount still exists, so deactivate it in the
    // Flutterwave dashboard too if it should stop receiving payments.
    await prisma.user.update({ where: { id: userId }, data: { isPaymentEligible: false } });
    await prisma.paymentEligibilityRequest.updateMany({
      where: { userId, status: "APPROVED" },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}