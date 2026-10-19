"use client";

import { useRouter } from "next/navigation";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();

  async function remove() {
    if (!confirm("حذف هذا المنتج؟")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={remove} className="btn-ghost text-red-300">
      حذف
    </button>
  );
}
