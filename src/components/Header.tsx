import Link from "next/link";
import { getSession } from "@/lib/auth";

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-black tracking-tight text-gold-400">
          ديجيتال ستور
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/products" className="text-paper/80 hover:text-gold-400">
            المنتجات
          </Link>
          {session ? (
            <>
              <Link href="/account" className="text-paper/80 hover:text-gold-400">
                حسابي
              </Link>
              {session.role === "ADMIN" ? (
                <Link href="/admin" className="btn-ghost">
                  لوحة التحكم
                </Link>
              ) : null}
              <form action="/api/auth/logout" method="post">
                <button className="text-paper/60 hover:text-paper">خروج</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-paper/80 hover:text-gold-400">
                دخول
              </Link>
              <Link href="/register" className="btn-gold">
                إنشاء حساب
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
