"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    setError("");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "تعذر إنشاء الحساب");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="card mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-black">حساب جديد</h1>
      <input name="name" placeholder="الاسم" required />
      <input name="email" type="email" placeholder="البريد" required />
      <input name="password" type="password" placeholder="كلمة المرور (6 أحرف فأكثر)" required />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button className="btn-gold w-full">إنشاء الحساب</button>
    </form>
  );
}
