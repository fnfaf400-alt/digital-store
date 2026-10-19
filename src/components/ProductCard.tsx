import Link from "next/link";
import { formatMoney } from "@/lib/money";

type ProductCardProps = {
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  type: string;
  coverEmoji: string;
};

export function ProductCard(product: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="card block p-6 hover:border-gold-500/40">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl">
        {product.coverEmoji}
      </div>
      <p className="mb-1 text-xs text-gold-500">{product.type}</p>
      <h3 className="mb-2 text-xl font-bold">{product.title}</h3>
      <p className="mb-5 text-sm leading-7 text-paper/70">{product.description}</p>
      <div className="flex items-center justify-between">
        <strong className="text-gold-400">{formatMoney(product.priceCents, product.currency)}</strong>
        <span className="text-sm text-paper/50">تسليم فوري</span>
      </div>
    </Link>
  );
}
