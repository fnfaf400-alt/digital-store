import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireUser();
  if (!user) redirect("/login?next=/account");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">مرحباً {user.name}</h1>
      <p className="text-paper/60">{user.email}</p>
      <div className="grid gap-4">
        {orders.length === 0 ? <p className="text-paper/60">لا توجد طلبات بعد.</p> : null}
        {orders.map((order) => (
          <Link key={order.id} href={`/account/orders/${order.id}`} className="card block p-6">
            <div className="flex items-center justify-between">
              <strong>طلب {order.id.slice(-6)}</strong>
              <span className="text-gold-400">{formatMoney(order.totalCents, order.currency)}</span>
            </div>
            <p className="mt-2 text-sm text-paper/60">
              {order.status === "PAID" ? "مدفوع" : order.status} · {order.items.map((item) => item.product.title).join("، ")}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
