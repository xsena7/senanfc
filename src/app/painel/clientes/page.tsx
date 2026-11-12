import Link from "next/link";
import { ChevronDown, Pencil, Search } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { KIND_LABEL } from "@/lib/catalog";
import { platePath } from "@/lib/codes";
import { KindIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

/** Estabelecimentos em gavetas: abre e vê todas as placas dele. */
export default async function Clientes({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const q = ((await searchParams).q ?? "").trim();
  const clients = await db.client.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
    take: 500,
    include: { plates: { where: { status: { not: "BLANK" } }, orderBy: { seq: "asc" }, include: { _count: { select: { taps: true } } } } },
  });
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-extrabold">Clientes</h1>
      <form className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input name="q" defaultValue={q} className="input pl-10" placeholder="Buscar estabelecimento" />
      </form>
      {clients.length === 0 && <p className="text-sm text-slate-500">Nenhum estabelecimento. Eles aparecem aqui quando uma placa é ativada.</p>}
      {clients.map((c) => {
        const on = c.plates.filter((p) => p.status === "ACTIVE").length;
        return (
          <details key={c.id} className="card group p-0 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300"}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-slate-500">{c.plates.length === 1 ? "1 placa" : `${c.plates.length} placas`}</p>
              </div>
              <span className="flex gap-1">
                {c.plates.map((p) => p.kind && <span key={p.id} className={p.status === "DISABLED" ? "opacity-30 grayscale" : ""}><KindIcon kind={p.kind} size="sm" /></span>)}
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
            </summary>
            <div className="space-y-2 border-t border-slate-100 p-3">
              {c.plates.map((p) => (
                <Link key={p.id} href={platePath(p.code)} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                  {p.kind && <KindIcon kind={p.kind} />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.kind ? KIND_LABEL[p.kind] : "—"}</p>
                    <p className="text-xs text-slate-500">{p.code} · {p._count.taps} toques</p>
                  </div>
                  <span className={`chip ${p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{p.status === "ACTIVE" ? "Ativa" : "Desativada"}</span>
                </Link>
              ))}
              <Link href={`/painel/clientes/${c.id}`} className="btn-ghost btn-sm w-full">
                <Pencil className="h-4 w-4" /> Editar links do estabelecimento
              </Link>
            </div>
          </details>
        );
      })}
    </div>
  );
}
