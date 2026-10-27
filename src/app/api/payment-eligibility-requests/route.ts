import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { accountName, bankAccountNo, bankCode, phoneNumber } = await req.json();
  if (!accountName || !bankAccountNo || !bankCode || !phoneNumber) {
    return NextResponse.json(
      {
        error:
          "Full name, bank, account number, and phone number are all required",
      },
      { status: 400 }
    );
  }

  try {
    const request = await prisma.paymentEligibilityRequest.upsert({
      where: { userId: session.user.id },
      update: {
        accountName,
        bankAccountNo,
        bankCode,
        phoneNumber,
        status: "PENDING",
        reviewedAt: null,
        submittedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        accountName,
        bankAccountNo,
        bankCode,
        phoneNumber,
      },
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
