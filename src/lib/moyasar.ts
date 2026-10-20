const MOYASAR_API = "https://api.moyasar.com/v1";

/**
 * يتحقق من أن المفتاح السري حقيقي وليس قيمة منمّطة (masked placeholder).
 * القيم المنمّطة تحتوي على `*` ولا تصلح للاستخدام.
 */
function isUsableSecretKey(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  // قيمة منمّطة أو نائبة
  if (trimmed.includes("*")) return false;
  // sk_test_ / sk_live_ + أحرف
  return /^sk_(test|live)_[A-Za-z0-9]{16,}$/.test(trimmed);
}

export function isMoyasarConfigured(): boolean {
  return isUsableSecretKey(process.env.MOYASAR_SECRET_KEY);
}

function authHeader(): string {
  const secret = process.env.MOYASAR_SECRET_KEY;
  if (!isUsableSecretKey(secret)) {
    throw new Error("MOYASAR_SECRET_KEY is missing or is a masked placeholder");
  }
  return "Basic " + Buffer.from(secret.trim() + ":").toString("base64");
}

export type MoyasarInvoice = {
  id: string;
  status: string;
  amount: number;
  currency: string;
  url?: string;
  metadata?: Record<string, unknown>;
};

export async function createInvoice(params: {
  amountCents: number;
  currency: string;
  description: string;
  orderId: string;
  callbackUrl: string;
}): Promise<MoyasarInvoice> {
  const res = await fetch(`${MOYASAR_API}/invoices`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.amountCents,
      currency: params.currency,
      description: params.description,
      callback_url: params.callbackUrl,
      metadata: { orderId: params.orderId },
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message ?? `HTTP ${res.status}`;
    throw new Error(`Moyasar invoice failed: ${message}`);
  }

  return data as MoyasarInvoice;
}

export async function getPayment(paymentId: string): Promise<MoyasarInvoice | null> {
  if (!isMoyasarConfigured()) return null;

  let res: Response;
  try {
    res = await fetch(`${MOYASAR_API}/payments/${paymentId}`, {
      headers: { Authorization: authHeader() },
      cache: "no-store",
    });
  } catch (err) {
    console.error("Moyasar getPayment request failed:", err);
    return null;
  }

  if (!res.ok) return null;
  return (await res.json()) as MoyasarInvoice;
}
