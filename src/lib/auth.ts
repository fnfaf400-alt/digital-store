import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { hashPassword, verifyPassword } from "./password";

export { hashPassword, verifyPassword };

const COOKIE = "ds_token";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is missing");
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "ADMIN";
};

export async function signToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function readToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.id || !payload.email || !payload.role) return null;
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name ?? ""),
      role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    };
  } catch {
    return null;
  }
}

export async function setSession(user: SessionUser) {
  const token = await signToken(user);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return readToken(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  } satisfies SessionUser;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user || user.role !== "ADMIN") return null;
  return user;
}
