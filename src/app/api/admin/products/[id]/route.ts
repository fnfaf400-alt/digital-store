import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/checkout";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات المنتج غير مكتملة" }, { status: 400 });
  }
  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id } = await params;
  await prisma.orderItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
