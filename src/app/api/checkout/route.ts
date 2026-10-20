import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/checkout";
import { createDownloadToken, createLicenseKey } from "@/lib/slug";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات الطلب غير صالحة" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.published) {
    return NextResponse.json({ error: "المنتج غير متاح" }, { status: 404 });
  }

  let discountCents = 0;
  let validCoupon: any = null;

  if (parsed.data.couponCode) {
    const cleanCode = parsed.data.couponCode.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt)) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses)
    ) {
      validCoupon = coupon;
      discountCents = Math.round((product.priceCents * coupon.discountPercent) / 100);
    }
  }

  const finalTotalCents = Math.max(0, product.priceCents - discountCents);
  const downloadToken = createDownloadToken();

  const order = await prisma.$transaction(async (tx) => {
    if (validCoupon) {
      await tx.coupon.update({
        where: { id: validCoupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    return await tx.order.create({
      data: {
        userId: user.id,
        totalCents: finalTotalCents,
        discountCents: discountCents,
        couponId: validCoupon ? validCoupon.id : null,
        currency: product.currency,
        status: "PENDING",
        items: {
          create: {
            productId: product.id,
            priceCents: finalTotalCents,
            licenseKey: product.type.includes("رخصة") ? createLicenseKey() : null,
            downloadToken: downloadToken,
          },
        },
      },
    });
  });

  return NextResponse.json({
    orderId: order.id,
    amountCents: order.totalCents,
    currency: order.currency,
    productTitle: product.title,
  });
}
