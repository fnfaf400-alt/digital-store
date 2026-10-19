import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });

  const { token } = await params;
  const item = await prisma.orderItem.findUnique({
    where: { downloadToken: token },
    include: { order: true, product: true },
  });

  if (!item || item.order.userId !== user.id || item.order.status !== "PAID") {
    return NextResponse.json({ error: "رابط غير صالح" }, { status: 404 });
  }
  if (item.downloadsUsed >= item.product.downloadLimit) {
    return NextResponse.json({ error: "تم استهلاك حد التنزيلات" }, { status: 429 });
  }

  await prisma.orderItem.update({
    where: { id: item.id },
    data: { downloadsUsed: { increment: 1 } },
  });

  return new NextResponse(item.product.fileContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${item.product.fileName}"`,
    },
  });
}
