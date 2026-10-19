import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">منتج رقمي جديد</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
