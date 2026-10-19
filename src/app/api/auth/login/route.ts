import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/checkout";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  await setSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return NextResponse.json({ ok: true, role: user.role });
}
