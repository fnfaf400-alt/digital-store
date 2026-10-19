import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">الطلبات</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-5">
            <div className="flex items-center justify-between">
              <strong>{order.user.name}</strong>
              <span className="text-gold-400">{formatMoney(order.totalCents)}</span>
            </div>
            <p className="mt-2 text-sm text-paper/60">
              {order.user.email} · {order.status} · {order.items.map((item) => item.product.title).join("، ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
