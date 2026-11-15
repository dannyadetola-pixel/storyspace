import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { reconcileTip } from "@/lib/reconcileTip";

export async function POST(req: Request) {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { reference } = await req.json();
  if (typeof reference !== "string" || !reference.startsWith("tip_")) {
    return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
  }

  try {
    const result = await reconcileTip(reference);
    console.log("[admin/tips/reconcile]", reference, result.outcome);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[admin/tips/reconcile] failed:", reference, err);
    return NextResponse.json(
      { error: "Couldn't reach Paystack. Try again." },
      { status: 500 }
    );
  }
}