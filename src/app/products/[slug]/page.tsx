import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getSession } from "@/lib/auth";
import { BuyButton } from "@/components/BuyButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.published) notFound();
  const session = await getSession();

  return (
    <article className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="card p-8">
        <p className="text-sm text-gold-500">
          {product.category.name} · {product.type}
        </p>
        <h1 className="mt-3 text-4xl font-black">{product.title}</h1>
        <p className="mt-5 whitespace-pre-wrap leading-8 text-paper/75">{product.longDescription}</p>
      </div>
      <aside className="card h-fit p-8">
        <div className="mb-6 text-5xl">{product.coverEmoji}</div>
        <p className="text-3xl font-black text-gold-400">
          {formatMoney(product.priceCents, product.currency)}
        </p>
        <p className="mt-3 text-sm text-paper/60">تسليم فوري عبر رابط تحميل آمن، مع حد {product.downloadLimit} تنزيلات.</p>
        <BuyButton productId={product.id} loggedIn={Boolean(session)} />
      </aside>
    </article>
  );
}
