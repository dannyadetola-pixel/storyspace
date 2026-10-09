import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

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

  try {
    const request = await prisma.paymentEligibilityRequest.update({
      where: { id },
      data: {
        status: decision === "approve" ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
      },
    });

    if (decision === "approve") {
      await prisma.user.update({
        where: { id: request.userId },
        data: { isPaymentEligible: true },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reviewing payment eligibility request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
