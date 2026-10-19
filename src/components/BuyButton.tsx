"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BuyButton({ productId, loggedIn }: { productId: string; loggedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function buy() {
    if (!loggedIn) {
      router.push(`/login?next=/products`);
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "تعذر إتمام الشراء");
      return;
    }
    router.push(`/account/orders/${data.orderId}`);
  }

  return (
    <div className="mt-6 space-y-3">
      <button onClick={buy} disabled={loading} className="btn-gold w-full">
        {loading ? "جارٍ إتمام الشراء..." : "اشترِ الآن"}
      </button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
