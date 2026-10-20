# ديجيتال ستور

متجر منتجات رقمية عربي: واجهة زبائن، واجهة برمجية، قاعدة بيانات، ولوحة تحكم للإدارة.

## التشغيل المحلي

يحتاج Node.js 20+ وGit.

```bash
npm install
npm run db:setup
npm test
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

- الإدارة: `admin@digital-store.local` / `Admin123!`
- عميل تجريبي: `sara@example.com` / `Customer123!`

## الدفع

الشراء يمر بدورة دفع كاملة: إنشاء طلب بحالة `PENDING` ← إنشاء فاتورة في البوابة ←
دفع العميل ← callback من البوابة ← التحقق من المبلغ والعملة ← تحويل الطلب إلى `PAID` ←
إتاحة رابط التحميل `/api/download/[token]` وإرسال بريد التأكيد.

### إعداد Moyasar

انسخ `.env.example` إلى `.env` وأضف مفاتيح البوابة (استخدم مفاتيح `test` للتجربة):

```bash
MOYASAR_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> `NEXT_PUBLIC_APP_URL` هو أساس رابط إعادة التوجيه (callback) ورابط التنزيل في البريد.
> لا تستخدم `NEXTAUTH_URL` — هذا المشروع لا يعتمد على NextAuth.

### الدفع التجريبي (بدون بوابة)

إذا لم تكن المفاتيح موجودة، يحوّل `BuyButton` تلقائياً إلى المسار التجريبي
`/payments/simulate` الذي يحوّل الطلب من `PENDING` إلى `PAID` محلياً.
في الإنتاج يُمنع افتراضياً، ويمكن تفعيله بـ `ALLOW_SIMULATED_PAYMENTS="true"`.

### مسارات الدفع

| المسار | الوظيفة |
| --- | --- |
| `POST /api/checkout` | إنشاء الطلب (`PENDING`) |
| `POST /api/payments/moyasar/initiate` | إنشاء فاتورة وربطها بالطلب |
| `GET /api/payments/moyasar/callback` | التحقق من الدفع وتحويل الطلب إلى `PAID` |
| `POST /api/payments/simulate` | دفع تجريبي (تطوير فقط) |

## النشر بـ Docker

```bash
docker compose up --build -d
```

للإنتاج غيّر `JWT_SECRET` و`ADMIN_PASSWORD` وأضف مفاتيح Moyasar في البيئة قبل التشغيل.

## البنية

- Frontend: `src/app` و`src/components`
- Backend: `src/app/api`
- Database: Prisma + SQLite في `prisma/`
- Admin: `src/app/admin`
- Digital products: محتوى الملف يُحفظ مع المنتج ويُنزَّل عبر `/api/download/[token]`
- CI: `.github/workflows/ci.yml` يشغّل `tsc` و`vitest` و`next build`
