import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsPDF } from "jspdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "يلزم تسجيل الدخول" }, { status: 401 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      coupon: true,
      user: true,
    },
  });

  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
  }

  const doc = new jsPDF();

  // ترويسة الفاتورة
  doc.setFontSize(20);
  doc.text("INVOICE / RECEIPT", 105, 25, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Order ID: ${order.id}`, 20, 42);
  doc.text(`Date: ${new Date(order.createdAt).toISOString().split('T')[0]}`, 20, 49);
  doc.text(`Email: ${order.user.email}`, 20, 56);
  doc.text(`Status: ${order.status}`, 20, 63);

  // خط فاصل
  doc.setLineWidth(0.5);
  doc.line(20, 70, 190, 70);

  // رأس الجدول
  doc.setFontSize(11);
  doc.text("Item Description", 20, 78);
  doc.text("Price", 170, 78, { align: "right" });
  doc.line(20, 82, 190, 82);

  // عناصر الطلب
  let y = 92;
  order.items.forEach((item) => {
    const originalItemPrice = (item.priceCents + (order.discountCents || 0)) / 100;
    doc.text(item.product.slug, 20, y);
    doc.text(`${originalItemPrice.toFixed(2)} ${order.currency}`, 170, y, { align: "right" });
    y += 10;
  });

  doc.line(20, y, 190, y);
  y += 10;

  // تفاصيل الكوبون والخصم
  if (order.coupon) {
    doc.text(`Coupon Discount (${order.coupon.code}):`, 120, y);
    doc.text(`-${(order.discountCents / 100).toFixed(2)} ${order.currency}`, 170, y, { align: "right" });
    y += 8;
  }

  // المجموع النهائي
  doc.setFontSize(12);
  doc.text("Total Paid:", 120, y + 2);
  doc.text(`${(order.totalCents / 100).toFixed(2)} ${order.currency}`, 170, y + 2, { align: "right" });

  const pdfOutput = doc.output("arraybuffer");

  return new NextResponse(pdfOutput, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.id}.pdf"`,
    },
  });
}
