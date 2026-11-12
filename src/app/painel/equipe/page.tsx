import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toggleUserAction } from "@/app/actions/team";
import { NewUser, ResetPassword } from "./forms";

export const dynamic = "force-dynamic";

export default async function Equipe() {
  const me = await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Equipe</h1>
      {users.map((u) => (
        <div key={u.id} className={`card space-y-2 ${u.active ? "" : "opacity-50"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{u.name}</p>
              <p className="text-xs text-slate-500">usuário: {u.login} · {u.role === "ADMIN" ? "Dono" : "Vendedor"}</p>
            </div>
            {u.id !== me.id && (
              <form action={toggleUserAction}>
                <input type="hidden" name="userId" value={u.id} />
                <button className="btn-ghost btn-sm">{u.active ? "Bloquear" : "Liberar"}</button>
              </form>
            )}
          </div>
          <ResetPassword userId={u.id} />
        </div>
      ))}
      <div className="card space-y-2">
        <p className="font-bold">Adicionar pessoa</p>
        <NewUser />
      </div>
    </div>
  );
}
