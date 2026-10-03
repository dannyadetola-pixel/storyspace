import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { bankAccountNo, bankCode } = await req.json();
  if (!bankAccountNo || !bankCode) {
    return NextResponse.json(
      { error: "Bank account number and bank code are required" },
      { status: 400 }
    );
  }

  try {
    const request = await prisma.paymentEligibilityRequest.upsert({
      where: { userId: session.user.id },
      update: {
        bankAccountNo,
        bankCode,
        status: "PENDING",
        reviewedAt: null,
        submittedAt: new Date(),
      },
      create: { userId: session.user.id, bankAccountNo, bankCode },
    });
    return NextResponse.json(request);
  } catch (err) {
    console.error("Payment eligibility request failed:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
