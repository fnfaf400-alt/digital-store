/**
 * مساعدات الدفع — دوال نقية قابلة للاختبار بدون أي اعتماد على الشبكة أو قاعدة البيانات.
 */

/**
 * يبني رابط إعادة التوجيه (callback) بعد الدفع.
 * يعتمد على NEXT_PUBLIC_APP_URL لأن NEXTAUTH_URL غير معرّف في المشروع.
 */
export function buildCallbackUrl(baseUrl?: string): string {
  const base = (baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
  return `${base}/api/payments/moyasar/callback`;
}

/**
 * يتحقق من أن المبلغ المدفوع يطابق تماماً قيمة الطلب.
 * الدفع بمبلغ أقل مرفوض — الأهم أمنياً في متجر رقمي.
 */
export function isPaymentAmountValid(
  paidCents: number | undefined,
  expectedCents: number,
): boolean {
  if (typeof paidCents !== "number" || !Number.isFinite(paidCents)) return false;
  return paidCents === expectedCents;
}

/**
 * يتحقق من تطابق العملة بين ما دُفع وما هو مطلوب.
 */
export function isCurrencyValid(
  paidCurrency: string | undefined,
  expectedCurrency: string,
): boolean {
  if (!paidCurrency) return true; // البوابة قد لا ترسل العملة
  return paidCurrency === expectedCurrency;
}

/**
 * يستخرج رقم الطلب من بيانات الدفع الواردة من البوابة.
 */
export function extractOrderId(metadata: Record<string, unknown> | undefined): string | null {
  const value = metadata?.orderId;
  if (typeof value !== "string" || value.length === 0) return null;
  return value;
}
