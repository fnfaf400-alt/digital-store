import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createInvoice, isMoyasarConfigured } from "@/lib/moyasar";
import { buildCallbackUrl } from "@/lib/payment";

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

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  if (order.status === "PAID") {
    return NextResponse.json({
      orderId: order.id,
      alreadyPaid: true,
      redirectUrl: `/account/orders/${order.id}`,
    });
  }

  if (!isMoyasarConfigured()) {
    return NextResponse.json(
      { error: "بوابة الدفع غير مهيأة. أضف MOYASAR_SECRET_KEY إلى ملف .env" },
      { status: 503 },
    );
  }

  // إعادة استخدام جلسة الدفع السابقة إن وُجدت
  if (order.paymentId && order.paymentUrl) {
    return NextResponse.json({
      orderId: order.id,
      paymentUrl: order.paymentUrl,
      paymentId: order.paymentId,
    });
  }

  const productTitle = order.items[0]?.product.title ?? "منتج رقمي";

  try {
    const invoice = await createInvoice({
      amountCents: order.totalCents,
      currency: order.currency,
      description: productTitle.slice(0, 120),
      orderId: order.id,
      callbackUrl: buildCallbackUrl(),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: invoice.id, paymentUrl: invoice.url ?? null },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentId: invoice.id,
      paymentUrl: invoice.url ?? null,
    });
  } catch (err) {
    console.error("Moyasar initiate error:", err);
    return NextResponse.json(
      { error: "تعذر بدء عملية الدفع. حاول مرة أخرى." },
      { status: 502 },
    );
  }
}
