import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/checkout";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات المنتج غير مكتملة" }, { status: 400 });
  }

  const slugBase = slugify(parsed.data.title) || `product-${Date.now()}`;
  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
      published: parsed.data.published ?? true,
    },
  });
  return NextResponse.json({ product });
}
