import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [users, products, orders, paid] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.findMany({ where: { status: "PAID" } }),
  ]);
  const revenue = paid.reduce((sum, order) => sum + order.totalCents, 0);

  const cards = [
    { label: "الإيرادات", value: formatMoney(revenue) },
    { label: "الطلبات", value: String(orders) },
    { label: "المنتجات", value: String(products) },
    { label: "المستخدمون", value: String(users) },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">نظرة عامة</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-6">
            <p className="text-sm text-paper/50">{card.label}</p>
            <p className="mt-2 text-2xl font-black text-gold-400">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
