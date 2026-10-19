import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/checkout";
import { createDownloadToken, createLicenseKey } from "@/lib/slug";

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "منتج غير صالح" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.published) {
    return NextResponse.json({ error: "المنتج غير متاح" }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalCents: product.priceCents,
      currency: product.currency,
      status: "PAID",
      items: {
        create: {
          productId: product.id,
          priceCents: product.priceCents,
          licenseKey: product.type.includes("رخصة") ? createLicenseKey() : null,
          downloadToken: createDownloadToken(),
        },
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
