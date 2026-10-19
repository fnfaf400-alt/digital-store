import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="space-y-14">
      <section className="card overflow-hidden p-8 md:p-14">
        <p className="mb-3 text-sm text-gold-500">متجر عربي للمنتجات الرقمية</p>
        <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
          اشترِ الملف، واستلمه خلال ثوانٍ.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-paper/70">
          كتب، قوالب، دورات، ورخص برمجيات. دفع تجريبي، تسليم برابط آمن، ولوحة تحكم كاملة للبائع.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className="btn-gold">
            تصفح المنتجات
          </Link>
          <Link href="/register" className="btn-ghost">
            ابدأ كعميل
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">منتجات مختارة</h2>
          <Link href="/products" className="text-sm text-gold-400">
            عرض الكل
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </div>
  );
}
