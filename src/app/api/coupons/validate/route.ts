import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, message: "يرجى إدخال رمز الكوبون" },
        { status: 400 }
      );
    }
    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });
    if (!coupon) {
      return NextResponse.json(
        { valid: false, message: "رمز الكوبون غير صحيح" },
        { status: 404 }
      );
    }
    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, message: "هذا الكوبون معطّل حالياً" },
        { status: 400 }
      );
    }
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { valid: false, message: "انتهت صلاحية هذا الكوبون" },
        { status: 400 }
      );
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { valid: false, message: "وصل الكوبون إلى الحد الأقصى للاستخدام" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      valid: true,
      message: "تم تطبيق الكوبون بنجاح",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, message: "حدث خطأ أثناء التحقق من الكوبون" },
      { status: 500 }
    );
  }
}
