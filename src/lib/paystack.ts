import { createHmac, timingSafeEqual } from "node:crypto";

const BASE = "https://api.paystack.co";

// The platform keeps this share of every tip. The creator receives the rest.
export const PLATFORM_COMMISSION = 0.3; // 30%

// Platform's share in kobo. Rounded to a whole kobo.
export function platformFeeKobo(amountKobo: number): number {
  return Math.round(amountKobo * PLATFORM_COMMISSION);
}

// Creator's share in kobo.
export function creatorShareKobo(amountKobo: number): number {
  return amountKobo - platformFeeKobo(amountKobo);
}

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

type Envelope<T> = { status?: boolean; message?: string; data?: T };

async function call<T>(
  path: string,
  init?: { method?: "GET" | "POST"; body?: unknown }
): Promise<{ ok: boolean; message: string; data: T | null }> {
  const res = await fetch(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const body = (await res.json().catch(() => null)) as Envelope<T> | null;
  return {
    ok: res.ok && body?.status === true,
    message: body?.message ?? "Paystack request failed",
    data: body?.data ?? null,
  };
}

// Nigerian banks with their codes, for the bank dropdown.
export async function getPaystackBanks(): Promise<{ code: string; name: string }[]> {
  const res = await call<{ name: string; code: string }[]>(
    "/bank?country=nigeria&perPage=100"
  );
  if (!res.ok || !res.data) throw new Error(res.message);
  return res.data.map((b) => ({ code: b.code, name: b.name }));
}

// Checks that an account number exists at a bank and returns the name on it.
export async function resolveAccount(
  accountNumber: string,
  bankCode: string
): Promise<string> {
  const params = new URLSearchParams({
    account_number: accountNumber,
    bank_code: bankCode,
  });
  const res = await call<{ account_name: string }>(`/bank/resolve?${params}`);
  if (!res.ok || !res.data) throw new Error(res.message);
  return res.data.account_name;
}

// Creates the subaccount that receives a creator's share of each tip.
export async function createSubaccount(params: {
  businessName: string;
  bankCode: string;
  accountNumber: string;
}): Promise<string> {
  const res = await call<{ subaccount_code: string }>("/subaccount", {
    method: "POST",
    body: {
      business_name: params.businessName,
      bank_code: params.bankCode,
      account_number: params.accountNumber,
      // Each tip sets its own transaction_charge, so this default is only a
      // fallback. It's set to the platform's commission to match.
      percentage_charge: PLATFORM_COMMISSION * 100,
    },
  });
  if (!res.ok || !res.data) throw new Error(res.message);
  return res.data.subaccount_code;
}

// Starts a payment and returns the Paystack checkout link.
export async function initializeTransaction(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  subaccountCode: string;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const res = await call<{ authorization_url: string }>("/transaction/initialize", {
    method: "POST",
    body: {
      email: params.email,
      amount: params.amountKobo,
      reference: params.reference,
      callback_url: params.callbackUrl,
      subaccount: params.subaccountCode,
      // The platform's flat share of this payment. See PLATFORM_COMMISSION.
      transaction_charge: platformFeeKobo(params.amountKobo),
      // Paystack's own fees come out of the platform's share.
      bearer: "account",
      metadata: params.metadata ?? {},
    },
  });
  if (!res.ok || !res.data) throw new Error(res.message);
  return res.data.authorization_url;
}

export type PaystackTransaction = {
  id: number;
  status: string;
  reference: string;
  amount: number; // kobo
  currency: string;
};

// Re-checks a payment directly with Paystack. Never trust the redirect alone.
export async function verifyTransaction(reference: string) {
  return call<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

// Paystack signs each webhook with HMAC-SHA512 of the raw body, using the
// secret key. The request is accepted only when the signatures match.
export function webhookSignatureValid(rawBody: string, signature: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
