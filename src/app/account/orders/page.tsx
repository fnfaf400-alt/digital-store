import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  payment_failed: "لم تكتمل عملية الدفع.",
  verification_failed: "تعذر التحقق من الدفع. تواصل معنا.",
  not_paid: "لم يتم تسجيل الدفعة.",
  missing_order: "تعذر ربط الدفعة بالطلب.",
  order_not_found: "الطلب غير موجود.",
  amount_mismatch: "مبلغ الدفعة لا يطابق قيمة الطلب.",
  currency_mismatch: "عملة الدفعة لا تطابق قيمة الطلب.",
  server_error: "حدث خطأ أثناء معالجة الدفع.",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login?next=/account/orders");

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black">طلباتي</h1>
        <Link href="/account" className="text-sm text-gold-400">
          رجوع إلى حسابي
        </Link>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      {orders.length === 0 ? (
        <p className="text-paper/60">لا توجد طلبات بعد.</p>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="card block p-6">
              <div className="flex items-center justify-between">
                <strong>طلب {order.id.slice(-6)}</strong>
                <span className="text-gold-400">{formatMoney(order.totalCents, order.currency)}</span>
              </div>
              <p className="mt-2 text-sm text-paper/60">
                {order.status === "PAID" ? "مدفوع" : order.status === "FAILED" ? "فشل" : "بانتظار الدفع"}
                {" · "}
                {order.items.map((item) => item.product.title).join("، ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
