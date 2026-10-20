"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SimulatePay() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "تعذر إتمام الدفع التجريبي");
        return;
      }
      router.push(data.redirectUrl ?? `/account/orders/${orderId}`);
      router.refresh();
    } catch {
      setLoading(false);
      setError("حدث خطأ أثناء الدفع التجريبي");
    }
  }

  return (
    <div className="card mx-auto max-w-md space-y-4 p-8 text-center">
      <h1 className="text-2xl font-black">دفع تجريبي</h1>
      <p className="text-sm text-paper/70">
        هذه بوابة دفع وهمية مخصّصة للتطوير والاختبار فقط. اضغط الزر لمحاكاة نجاح الدفع.
      </p>
      <button onClick={pay} disabled={loading || !orderId} className="btn-gold w-full">
        {loading ? "جارٍ المعالجة..." : "محاكاة الدفع الناجح"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}

export default function SimulatePage() {
  return (
    <Suspense>
      <SimulatePay />
    </Suspense>
  );
}
