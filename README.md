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

الشراء يستخدم دفعاً تجريبياً ويُسلّم الملف فوراً مع رابط تنزيل محدود ومفتاح رخصة للمنتجات من نوع رخصة.

## النشر بـ Docker

```bash
docker compose up --build -d
```

للإنتاج غيّر `JWT_SECRET` و`ADMIN_PASSWORD` في البيئة قبل التشغيل.

## البنية

- Frontend: `src/app` و`src/components`
- Backend: `src/app/api`
- Database: Prisma + SQLite في `prisma/`
- Admin: `src/app/admin`
- Digital products: محتوى الملف يُحفظ مع المنتج ويُنزَّل عبر `/api/download/[token]`
