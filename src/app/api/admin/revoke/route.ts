import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notify";

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
    await notify({
      userId,
      type: "VERIFICATION_REVOKED",
      message: "Your verification has been revoked",
      link: "/profile",
    });
  } else {
    // Revoking payment eligibility stops new tips reaching this creator.
    await prisma.user.update({ where: { id: userId }, data: { isPaymentEligible: false } });
    await prisma.paymentEligibilityRequest.updateMany({
      where: { userId, status: "APPROVED" },
      data: { status: "REJECTED", reviewedAt: new Date() },
    });
    await notify({
      userId,
      type: "PAYMENT_REVOKED",
      message: "Your payment approval has been revoked",
      link: "/profile",
    });
  }

  return NextResponse.json({ ok: true });
}