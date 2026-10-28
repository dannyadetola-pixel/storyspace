import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { origin, searchParams } = url;
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");
  const redirectStatus = searchParams.get("status");

  const tip = txRef
    ? await prisma.tip.findUnique({
        where: { txRef },
        include: { recipient: { select: { username: true } } },
      })
    : null;

  if (!tip) {
    return NextResponse.redirect(`${origin}/`);
  }

  const back = (result: "paid=1" | "failed=1") =>
    NextResponse.redirect(`${origin}/tip/${tip.recipient.username}?${result}`);

  // Already confirmed earlier (e.g. the page was refreshed) — never credit twice.
  if (tip.status === "SUCCESSFUL") {
    return back("paid=1");
  }

  const markFailed = () =>
    prisma.tip.updateMany({
      where: { id: tip.id, status: "PENDING" },
      data: { status: "FAILED" },
    });

  if (redirectStatus !== "successful" || !transactionId) {
    await markFailed();
    return back("failed=1");
  }

  // The redirect's status is just a claim from the browser. Confirm with
  // Flutterwave directly, using our secret key, before trusting it.
  const verifyRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` },
    }
  );
  const verify = await verifyRes.json();
  console.log("[flutterwave] verify response:", verifyRes.status, JSON.stringify(verify));

  const t = verify?.data;
  const matches =
    verify?.status === "success" &&
    t?.status === "successful" &&
    t?.tx_ref === tip.txRef &&
    t?.currency === "NGN" &&
    Number(t?.amount) === tip.amountKobo / 100;

  if (!matches) {
    await markFailed();
    return back("failed=1");
  }

  // updateMany with the PENDING condition means two overlapping callbacks
  // can't both flip it — only the first one wins.
  await prisma.tip.updateMany({
    where: { id: tip.id, status: "PENDING" },
    data: {
      status: "SUCCESSFUL",
      flutterwaveTransactionId: String(transactionId),
    },
  });

  return back("paid=1");
}
