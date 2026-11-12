import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { dateTime, startOfDayBR, startOfMonthBR } from "@/lib/format";
import { KIND_LABEL } from "@/lib/catalog";
import { platePath } from "@/lib/codes";
import { KindIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

const PERIODS = { hoje: "Hoje", mes: "Mês", tudo: "Tudo" } as const;

/** Placas configuradas: quantas, quem configurou e quando. */
export default async function Vendas({ searchParams }: { searchParams: Promise<{ p?: string; v?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const p = (sp.p && sp.p in PERIODS ? sp.p : "hoje") as keyof typeof PERIODS;
  const since = p === "hoje" ? startOfDayBR() : p === "mes" ? startOfMonthBR() : undefined;
  const where = {
    activatedAt: since ? { gte: since } : { not: null },
    ...(sp.v ? { activatedById: sp.v } : {}),
  };
  const [plates, total, byUser, users] = await Promise.all([
    db.plate.findMany({ where, orderBy: { activatedAt: "desc" }, take: 300, include: { client: true, activatedBy: true } }),
    db.plate.count({ where }),
    db.plate.groupBy({ by: ["activatedById"], where: { activatedAt: since ? { gte: since } : { not: null } }, _count: true }),
    db.user.findMany({ orderBy: { name: "asc" } }),
  ]);
  const q = (o: Record<string, string | undefined>) =>
    "?" + new URLSearchParams(Object.entries({ p, v: sp.v, ...o }).filter(([, x]) => x) as [string, string][]).toString();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Vendas</h1>
      <div className="flex gap-1 rounded-xl bg-slate-200/60 p-1">
        {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((k) => (
          <Link key={k} href={q({ p: k })} className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold ${p === k ? "bg-gradient-to-r from-brand-500/50 to-cyan-400/40 text-white shadow-[0_0_20px_-5px_rgba(34,211,238,.6)]" : "text-slate-500"}`}>
            {PERIODS[k]}
          </Link>
        ))}
      </div>

      <div className="card text-center">
        <p className="text-sm text-slate-500">Placas configuradas {p === "hoje" ? "hoje" : p === "mes" ? "neste mês" : "no total"}</p>
        <p className="text-glow mt-1 text-5xl font-extrabold">{total}</p>
      </div>

      {byUser.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href={q({ v: "" })} className={`chip px-3 py-1.5 ${!sp.v ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}>Todos</Link>
          {byUser.map((b) => {
            const u = users.find((x) => x.id === b.activatedById);
            if (!u) return null;
            return (
              <Link key={u.id} href={q({ v: u.id })} className={`chip px-3 py-1.5 ${sp.v === u.id ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}>
                {u.name.split(" ")[0]} · {b._count}
              </Link>
            );
          })}
        </div>
      )}

      {plates.length === 0 && <p className="text-sm text-slate-500">Nenhuma placa configurada nesse período.</p>}
      {plates.map((pl) => (
        <Link key={pl.id} href={platePath(pl.code)} className="card flex items-center gap-3">
          {pl.kind && <KindIcon kind={pl.kind} />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{pl.client?.name ?? "—"}</p>
            <p className="text-xs text-slate-500">{pl.code} · {pl.kind ? KIND_LABEL[pl.kind] : ""}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold text-slate-700">{pl.activatedBy?.name.split(" ")[0] ?? "—"}</p>
            <p className="text-slate-500">{pl.activatedAt ? dateTime(pl.activatedAt) : ""}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
