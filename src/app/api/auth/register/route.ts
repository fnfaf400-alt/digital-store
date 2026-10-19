import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setSession } from "@/lib/auth";
import { registerSchema } from "@/lib/checkout";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) {
    return NextResponse.json({ error: "البريد مستخدم مسبقاً" }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  await setSession({ id: user.id, email: user.email, name: user.name, role: user.role });
  return NextResponse.json({ ok: true });
}
