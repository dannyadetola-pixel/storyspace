// split_value here is the PLATFORM's cut, not the creator's — Flutterwave
// deducts this percentage and routes the remainder to the subaccount
// automatically on every transaction that references it.
const PLATFORM_COMMISSION = 0.1; // 10%

export async function createFlutterwaveSubaccount(params: {
  accountBank: string;
  accountNumber: string;
  businessName: string;
  businessMobile: string;
}): Promise<{ subaccountId: string; raw: unknown }> {
  const res = await fetch("https://api.flutterwave.com/v3/subaccounts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account_bank: params.accountBank,
      account_number: params.accountNumber,
      business_name: params.businessName,
      business_mobile: params.businessMobile,
      country: "NG",
      split_type: "percentage",
      split_value: PLATFORM_COMMISSION,
    }),
  });

  const data = await res.json();

  // Logged deliberately — this is the first real call to a brand new API,
  // and the exact shape of `data.data` (subaccount_id vs id) is worth
  // confirming against the real response rather than trusting docs alone,
  // same lesson as every other "first call to a new service" tonight.
  console.log("[flutterwave] create subaccount response:", JSON.stringify(data));

  if (data.status !== "success") {
    throw new Error(data.message || "Flutterwave rejected the subaccount request");
  }

  return { subaccountId: data.data.subaccount_id, raw: data };
}
