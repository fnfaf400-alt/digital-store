import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?next=/admin");

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="card h-fit space-y-2 p-4 text-sm">
        <p className="px-3 pb-2 text-xs text-gold-500">لوحة التحكم</p>
        <Link className="block rounded-xl px-3 py-2 hover:bg-white/5" href="/admin">
          نظرة عامة
        </Link>
        <Link className="block rounded-xl px-3 py-2 hover:bg-white/5" href="/admin/products">
          المنتجات
        </Link>
        <Link className="block rounded-xl px-3 py-2 hover:bg-white/5" href="/admin/orders">
          الطلبات
        </Link>
        <Link className="block rounded-xl px-3 py-2 hover:bg-white/5" href="/admin/users">
          المستخدمون
        </Link>
      </aside>
      <div>{children}</div>
    </div>
  );
}
