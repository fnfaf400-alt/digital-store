"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type ProductInput = {
  id?: string;
  title?: string;
  description?: string;
  longDescription?: string;
  priceCents?: number;
  type?: string;
  coverEmoji?: string;
  fileName?: string;
  fileContent?: string;
  downloadLimit?: number;
  categoryId?: string;
  published?: boolean;
};

export function ProductForm({ categories, product }: { categories: Category[]; product?: ProductInput }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(formData: FormData) {
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      longDescription: formData.get("longDescription"),
      priceCents: Math.round(Number(formData.get("price")) * 100),
      type: formData.get("type"),
      coverEmoji: formData.get("coverEmoji"),
      fileName: formData.get("fileName"),
      fileContent: formData.get("fileContent"),
      downloadLimit: Number(formData.get("downloadLimit")),
      categoryId: formData.get("categoryId"),
      published: formData.get("published") === "on",
    };
    const url = product?.id ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const response = await fetch(url, {
      method: product?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "تعذر حفظ المنتج");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="card space-y-4 p-6">
      <input name="title" defaultValue={product?.title} placeholder="العنوان" required />
      <input name="description" defaultValue={product?.description} placeholder="وصف قصير" required />
      <textarea name="longDescription" defaultValue={product?.longDescription} rows={5} placeholder="الوصف الكامل" />
      <div className="grid gap-4 md:grid-cols-2">
        <input name="price" type="number" step="0.01" defaultValue={((product?.priceCents ?? 0) / 100).toString()} placeholder="السعر" required />
        <input name="type" defaultValue={product?.type ?? "كتاب إلكتروني"} placeholder="النوع" />
        <input name="coverEmoji" defaultValue={product?.coverEmoji ?? "📦"} placeholder="أيقونة" />
        <input name="downloadLimit" type="number" defaultValue={product?.downloadLimit ?? 5} />
        <input name="fileName" defaultValue={product?.fileName ?? "product.txt"} placeholder="اسم الملف" />
        <select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <textarea name="fileContent" defaultValue={product?.fileContent} rows={8} placeholder="محتوى الملف الرقمي الذي سيُسلَّم بعد الشراء" />
      <label className="flex items-center gap-2 text-sm">
        <input name="published" type="checkbox" defaultChecked={product?.published ?? true} className="w-auto" />
        منشور في المتجر
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button className="btn-gold">حفظ المنتج</button>
    </form>
  );
}
