import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(category ? { category: { slug: category } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">المنتجات الرقمية</h1>
      <div className="mb-8 flex flex-wrap gap-2">
        <a href="/products" className={`btn-ghost ${!category ? "border-gold-500/60" : ""}`}>
          الكل
        </a>
        {categories.map((item) => (
          <a
            key={item.id}
            href={`/products?category=${item.slug}`}
            className={`btn-ghost ${category === item.slug ? "border-gold-500/60" : ""}`}
          >
            {item.name}
          </a>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
