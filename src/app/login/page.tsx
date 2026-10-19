"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "بيانات غير صحيحة");
      return;
    }
    router.push(params.get("next") || (data.role === "ADMIN" ? "/admin" : "/account"));
    router.refresh();
  }

  return (
    <form action={onSubmit} className="card mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-black">دخول</h1>
      <input name="email" type="email" placeholder="البريد" required />
      <input name="password" type="password" placeholder="كلمة المرور" required />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button className="btn-gold w-full">دخول</button>
      <p className="text-xs text-paper/50">تجريبي للإدارة: admin@digital-store.local / Admin123!</p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
