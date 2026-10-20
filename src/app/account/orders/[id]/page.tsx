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
    include: {
      items: { include: { product: true } },
      coupon: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">تفاصيل الطلب</h1>
          <p className="mt-1 text-paper/60">
            الحالة: {order.status === "PAID" ? "مدفوع وتم التسليم" : order.status}
          </p>
        </div>
        
        {/* زر تحميل الفاتورة */}
        <a
          href={`/api/orders/${order.id}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-400 hover:bg-gold-500/20 transition-all flex items-center gap-2"
        >
          <span>📄</span>
          <span>تحميل فاتورة PDF</span>
        </a>
      </div>

      {order.items.map((item) => (
        <div key={item.id} className="card p-6">
          <h2 className="text-xl font-bold">{item.product.title}</h2>
          
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="text-gold-400 font-bold">
              المبلغ المدفوع: {formatMoney(item.priceCents, order.currency)}
            </span>
            {order.coupon ? (
              <span className="text-emerald-400 font-medium">
                (تم تطبيق كود {order.coupon.code} بخصم {order.coupon.discountPercent}%)
              </span>
            ) : null}
          </div>

          {item.licenseKey ? (
            <p className="mt-4 rounded-xl bg-black/30 p-3 font-mono text-sm">
              مفتاح الرخصة: {item.licenseKey}
            </p>
          ) : null}

          <div className="mt-5 flex gap-3">
            <a href={`/api/download/${item.downloadToken}`} className="btn-gold inline-flex">
              تنزيل الملف ({item.downloadsUsed}/{item.product.downloadLimit})
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
