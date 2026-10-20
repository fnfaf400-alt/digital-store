"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyButton({ productId, loggedIn }: { productId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");

  async function validateCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage("");
    setError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      setCouponLoading(false);

      if (res.ok && data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponMessage(`تم تطبيق خصم ${data.coupon.discountPercent}% بنجاح! 🎉`);
      } else {
        setAppliedCoupon(null);
        setCouponMessage(data.message || "كود الخصم غير صحيح");
      }
    } catch {
      setCouponLoading(false);
      setCouponMessage("حدث خطأ أثناء فحص الكوبون");
    }
  }

  async function handleCheckout() {
    if (!loggedIn) {
      router.push(`/login?next=/products`);
      return;
    }
    setLoading(true);
    setError("");

    try {
      // 1) إنشاء الطلب
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        setLoading(false);
        setError(checkoutData.error ?? "تعذر بدء عملية الشراء");
        return;
      }

      // 2) إنشاء جلسة الدفع مع البوابة
      const payRes = await fetch("/api/payments/moyasar/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: checkoutData.orderId }),
      });

      const payData = await payRes.json();

      if (!payRes.ok) {
        setLoading(false);
        setError(payData.error ?? "تعذر الاتصال ببوابة الدفع");
        return;
      }

      // الطلب مدفوع مسبقاً
      if (payData.alreadyPaid) {
        setLoading(false);
        router.push(payData.redirectUrl);
        return;
      }

      // البوابة غير مهيأة في بيئة التطوير — التحويل إلى الدفع التجريبي
      if (payRes.status === 503) {
        router.push(`/payments/simulate?orderId=${checkoutData.orderId}`);
        return;
      }

      // 3) التحويل إلى صفحة الدفع
      if (!payData.paymentUrl) {
        setLoading(false);
        setError("لم تُرجع البوابة رابط دفع. حاول مرة أخرى.");
        return;
      }

      window.location.href = payData.paymentUrl;
    } catch {
      setLoading(false);
      setError("حدث خطأ أثناء إتمام الطلب");
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-paper/70 font-medium">هل لديك كود خصم؟</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="مثال: WELCOME20"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={couponLoading || Boolean(appliedCoupon)}
            className="w-full rounded-lg border border-paper/20 bg-paper/5 px-3 py-2 text-sm text-paper uppercase placeholder:normal-case focus:border-gold-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={validateCoupon}
            disabled={couponLoading || !couponCode.trim() || Boolean(appliedCoupon)}
            className="rounded-lg bg-paper/10 px-4 py-2 text-sm font-semibold hover:bg-paper/20 disabled:opacity-50"
          >
            {couponLoading ? "..." : appliedCoupon ? "مُطبّق" : "تطبيق"}
          </button>
        </div>
        {couponMessage ? (
          <p className={`text-xs ${appliedCoupon ? "text-emerald-400" : "text-red-400"}`}>
            {couponMessage}
          </p>
        ) : null}
      </div>

      <button onClick={handleCheckout} disabled={loading} className="btn-gold w-full">
        {loading ? "جارٍ التحويل للدفع..." : appliedCoupon ? "اشترِ الآن بالسعر المخفض" : "اشترِ الآن"}
      </button>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
