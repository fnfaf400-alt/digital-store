import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-black">المستخدمون</h1>
      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="card p-5">
            <strong>{user.name}</strong>
            <p className="text-sm text-paper/60">
              {user.email} · {user.role === "ADMIN" ? "مدير" : "عميل"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
