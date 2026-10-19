import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { include: { product: true } } },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black">تفاصيل الطلب</h1>
      <p className="text-paper/60">الحالة: {order.status === "PAID" ? "مدفوع وتم التسليم" : order.status}</p>
      {order.items.map((item) => (
        <div key={item.id} className="card p-6">
          <h2 className="text-xl font-bold">{item.product.title}</h2>
          <p className="mt-2 text-gold-400">{formatMoney(item.priceCents, order.currency)}</p>
          {item.licenseKey ? (
            <p className="mt-4 rounded-xl bg-black/30 p-3 font-mono text-sm">مفتاح الرخصة: {item.licenseKey}</p>
          ) : null}
          <a href={`/api/download/${item.downloadToken}`} className="btn-gold mt-5 inline-flex">
            تنزيل الملف ({item.downloadsUsed}/{item.product.downloadLimit})
          </a>
        </div>
      ))}
    </div>
  );
}
