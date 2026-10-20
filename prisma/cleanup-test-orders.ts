/**
 * ينظّف طلبات الاختبار فقط — لا يحذف المستخدمين أو المنتجات.
 *
 * الطلبات المؤهلة للحذف:
 *  - طلبات حالتها PENDING أو FAILED
 *  - أو طلبات PAID تربطها ببريد اختبار (example.com) وأقدم من مدة الاحتفاظ
 *
 * لا يستخدم db:setup لأنه يحذف كل البيانات (مستخدمين ومنتجات).
 *
 * الاستخدام: npx tsx prisma/cleanup-test-orders.ts [--days 30] [--dry-run]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function argValue(flag: string, fallback: number): number {
  const index = process.argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : fallback;
}

async function main() {
  const days = argValue("--days", 30);
  const dryRun = process.argv.includes("--dry-run");
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const candidates = await prisma.order.findMany({
    where: {
      OR: [
        { status: { in: ["PENDING", "FAILED"] } },
        {
          status: "PAID",
          createdAt: { lt: cutoff },
          user: { email: { endsWith: "@example.com" } },
        },
      ],
    },
    select: { id: true, status: true, totalCents: true, createdAt: true, user: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (candidates.length === 0) {
    console.log("لا توجد طلبات تجريبية للحذف.");
    return;
  }

  const total = candidates.reduce((sum, order) => sum + order.totalCents, 0);
  console.log(`سيتم حذف ${candidates.length} طلب (الإجمالي ${total / 100} SAR)`);
  for (const order of candidates) {
    console.log(
      `  - ${order.id.slice(-8)} | ${order.status} | ${order.totalCents / 100} | ${order.user.email} | ${order.createdAt.toISOString()}`,
    );
  }

  if (dryRun) {
    console.log("\nوضع المعاينة فقط (--dry-run) — لم يتم الحذف.");
    return;
  }

  const ids = candidates.map((order) => order.id);
  const deleted = await prisma.order.deleteMany({ where: { id: { in: ids } } });
  console.log(`\nتم حذف ${deleted.count} طلب.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
