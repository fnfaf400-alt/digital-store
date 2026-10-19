import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const [users, products, orders] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count({ where: { status: "PAID" } }),
  ]);
  return NextResponse.json({ users, products, orders });
}
