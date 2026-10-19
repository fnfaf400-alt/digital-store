import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { DeleteProductButton } from "@/components/DeleteProductButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">المنتجات</h1>
        <Link href="/admin/products/new" className="btn-gold">
          منتج جديد
        </Link>
      </div>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="card flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-bold">
                {product.coverEmoji} {product.title}
              </p>
              <p className="text-sm text-paper/50">
                {product.category.name} · {formatMoney(product.priceCents)} · {product.published ? "منشور" : "مخفي"}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${product.id}`} className="btn-ghost">
                تعديل
              </Link>
              <DeleteProductButton id={product.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
