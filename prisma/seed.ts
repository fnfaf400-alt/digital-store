import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createLicenseKey } from "../src/lib/slug";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@digital-store.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const customerHash = await bcrypt.hash("Customer123!", 10);

  await prisma.user.create({
    data: {
      name: "مدير المتجر",
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      name: "سارة المشتري",
      email: "sara@example.com",
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  const books = await prisma.category.create({
    data: { name: "كتب إلكترونية", slug: "ebooks" },
  });
  const templates = await prisma.category.create({
    data: { name: "قوالب وتصميم", slug: "templates" },
  });
  const courses = await prisma.category.create({
    data: { name: "دورات رقمية", slug: "courses" },
  });
  const licenses = await prisma.category.create({
    data: { name: "رخص برمجيات", slug: "licenses" },
  });

  const products = [
    {
      title: "دليل بناء متجر رقمي",
      slug: "digital-store-playbook",
      description: "خطة عملية لإطلاق متجر منتجات رقمية خلال 30 يوماً.",
      longDescription:
        "كتاب إلكتروني يغطي اختيار المنتج، التسعير، صفحات الهبوط، التسليم التلقائي، وخدمة العملاء. يتضمن جداول جاهزة ونماذج رسائل.",
      priceCents: 7900,
      type: "كتاب إلكتروني",
      coverEmoji: "📘",
      fileName: "digital-store-playbook.txt",
      fileContent: `دليل بناء متجر رقمي\n\nالفصل 1: اختر منتجاً واحداً واضحاً.\nالفصل 2: ابن صفحة بيع تشرح النتيجة لا المزايا.\nالفصل 3: سلّم الملف فوراً بعد الدفع.\n\nمفتاح ملاحظاتك: ${createLicenseKey()}`,
      categoryId: books.id,
    },
    {
      title: "مجموعة عقود العمل الحر",
      slug: "freelance-contracts",
      description: "نماذج عقود عربية قابلة للتعديل للمستقلين والوكالات.",
      longDescription:
        "تشمل عقد تصميم، عقد تطوير، اتفاقية سرية، وملحق تسليم مراحل. جاهزة للنسخ والتخصيص.",
      priceCents: 4900,
      type: "حزمة ملفات",
      coverEmoji: "📜",
      fileName: "freelance-contracts.txt",
      fileContent:
        "عقد تقديم خدمات رقمية\nالطرف الأول: مقدم الخدمة\nالطرف الثاني: العميل\nنطاق العمل: يُحدد في الملحق أ\nطريقة التسليم: ملفات رقمية عبر رابط آمن.",
      categoryId: templates.id,
    },
    {
      title: "قوالب صفحات هبوط",
      slug: "landing-page-kit",
      description: "ثمانية تخطيطات جاهزة لمتاجر المنتجات الرقمية.",
      longDescription:
        "قوالب نصية لهيكل الصفحة: عنوان، وعد، إثبات اجتماعي، تسعير، وأسئلة شائعة. مناسبة لأي منشئ مواقع.",
      priceCents: 5900,
      type: "قوالب",
      coverEmoji: "🖼️",
      fileName: "landing-page-kit.txt",
      fileContent:
        "قالب 1: وعد واحد + زر شراء\nقالب 2: قصة تحول العميل\nقالب 3: مقارنة قبل/بعد\nقالب 4: عرض محدود الوقت",
      categoryId: templates.id,
    },
    {
      title: "دورة إطلاق منتج في أسبوع",
      slug: "launch-in-a-week",
      description: "سبع جلسات مسجلة نصياً من الفكرة حتى أول عملية بيع.",
      longDescription:
        "كل جلسة تنتهي بمهمة واحدة: بحث، عرض، صفحة، دفع تجريبي، إطلاق، وجمع آراء. مناسبة للمبتدئين.",
      priceCents: 14900,
      type: "دورة",
      coverEmoji: "🎓",
      fileName: "launch-in-a-week.txt",
      fileContent:
        "اليوم 1: حدّد الوعد\nاليوم 2: اكتب صفحة البيع\nاليوم 3: جهّز الملف الرقمي\nاليوم 4: فعّل الدفع\nاليوم 5: أرسل لأول 20 شخصاً\nاليوم 6: أصلح الاحتكاك\nاليوم 7: أطلق بهدوء",
      categoryId: courses.id,
    },
    {
      title: "رخصة منشئ الفواتير",
      slug: "invoice-maker-license",
      description: "مفتاح رخصة لأداة إنشاء الفواتير للاستخدام الشخصي.",
      longDescription:
        "بعد الشراء يصلك مفتاح رخصة فريد مع دليل التفعيل. الرخصة تسمح بجهاز واحد وتحديثات لسنة.",
      priceCents: 9900,
      type: "رخصة برمجيات",
      coverEmoji: "🔑",
      fileName: "invoice-maker-license.txt",
      fileContent: `رخصة منشئ الفواتير\nالحالة: نشطة\nالمدة: 12 شهراً\nملاحظة: يُولد مفتاح فريد لكل عملية شراء.`,
      categoryId: licenses.id,
    },
    {
      title: "حزمة إعلانات المتاجر",
      slug: "ads-copy-pack",
      description: "120 صياغة إعلانية عربية جاهزة للتجربة.",
      longDescription:
        "عناوين، أوصاف قصيرة، وردود على الاعتراضات لمنتجات رقمية: كتب، قوالب، ودورات.",
      priceCents: 3900,
      type: "حزمة نصوص",
      coverEmoji: "✍️",
      fileName: "ads-copy-pack.txt",
      fileContent:
        "عنوان: احصل على الملف خلال دقيقة بعد الدفع\nعنوان: منتج واحد. نتيجة واحدة. تسليم فوري.\nاعتراض: هل أحتاج خبرة؟ لا. اتبع الخطوات السبع.",
      categoryId: books.id,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  await prisma.setting.create({
    data: {
      id: "store",
      name: "ديجيتال ستور",
      tagline: "منتجات رقمية تُسلَّم فوراً بعد الشراء",
    },
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
