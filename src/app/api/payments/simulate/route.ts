import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";

const bodySchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  // يعمل فقط في بيئة التطوير أو عند غياب مفاتيح البوابة الحقيقية
  const allowSimulate = process.env.NODE_ENV !== "production" || process.env.ALLOW_SIMULATED_PAYMENTS === "true";
  if (!allowSimulate) {
    return NextResponse.json({ error: "الدفع التجريبي غير مفعّل" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: { include: { product: true } }, user: true },
  });

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({ orderId: order.id, redirectUrl: `/account/orders/${order.id}` });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "PAID", paidAt: new Date() },
    include: { items: { include: { product: true } }, user: true },
  });

  if (updated.items[0]) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    try {
      await sendOrderConfirmationEmail({
        to: updated.user.email,
        customerName: updated.user.name || "العميل",
        orderId: updated.id,
        productTitle: updated.items[0].product.title,
        downloadUrl: `${baseUrl}/api/download/${updated.items[0].downloadToken}`,
        totalFormatted: formatMoney(updated.totalCents, updated.currency),
      });
    } catch (err) {
      console.error("فشل إرسال الإيميل:", err);
    }
  }

  return NextResponse.json({ orderId: updated.id, redirectUrl: `/account/orders/${updated.id}` });
}
