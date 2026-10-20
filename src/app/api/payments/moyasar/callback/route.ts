import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatMoney } from "@/lib/money";
import { getPayment } from "@/lib/moyasar";
import {
  extractOrderId,
  isCurrencyValid,
  isPaymentAmountValid,
} from "@/lib/payment";

function redirectTo(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("id");
  const status = searchParams.get("status");

  if (!paymentId || status !== "paid") {
    return redirectTo(request, "/account/orders?error=payment_failed");
  }

  try {
    const paymentData = await getPayment(paymentId);

    if (!paymentData) {
      return redirectTo(request, "/account/orders?error=verification_failed");
    }

    if (paymentData.status !== "paid") {
      return redirectTo(request, "/account/orders?error=not_paid");
    }

    const orderId = extractOrderId(paymentData.metadata);
    if (!orderId) {
      return redirectTo(request, "/account/orders?error=missing_order");
    }

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return redirectTo(request, "/account/orders?error=order_not_found");
    }

    // idempotency: تم الدفع مسبقاً
    if (existing.status === "PAID") {
      return redirectTo(request, `/account/orders/${existing.id}`);
    }

    // التحقق من المبلغ — منع الدفع بمبلغ أقل
    if (!isPaymentAmountValid(paymentData.amount, existing.totalCents)) {
      console.error(
        `Amount mismatch for order ${existing.id}: paid=${paymentData.amount} expected=${existing.totalCents}`,
      );
      await prisma.order.update({ where: { id: existing.id }, data: { status: "FAILED" } });
      return redirectTo(request, "/account/orders?error=amount_mismatch");
    }

    // التحقق من العملة
    if (!isCurrencyValid(paymentData.currency, existing.currency)) {
      console.error(
        `Currency mismatch for order ${existing.id}: paid=${paymentData.currency} expected=${existing.currency}`,
      );
      await prisma.order.update({ where: { id: existing.id }, data: { status: "FAILED" } });
      return redirectTo(request, "/account/orders?error=currency_mismatch");
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", paidAt: new Date(), paymentId },
      include: {
        items: { include: { product: true } },
        user: true,
      },
    });

    if (order && order.items[0]) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      try {
        await sendOrderConfirmationEmail({
          to: order.user.email,
          customerName: order.user.name || "العميل",
          orderId: order.id,
          productTitle: order.items[0].product.title,
          downloadUrl: `${baseUrl}/api/download/${order.items[0].downloadToken}`,
          totalFormatted: formatMoney(order.totalCents, order.currency),
        });
      } catch (err) {
        console.error("فشل إرسال الإيميل:", err);
      }
    }

    return redirectTo(request, `/account/orders/${order.id}`);
  } catch (err) {
    console.error("Moyasar callback error:", err);
    return redirectTo(request, "/account/orders?error=server_error");
  }
}
