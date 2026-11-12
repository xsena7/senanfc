import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { KIND_EMOJI, KIND_LABEL } from "@/lib/catalog";
import { SaleRow } from "@/components/sale-row";
import { EditClient } from "./edit";

export const dynamic = "force-dynamic";

export default async function Cliente({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { erro } = await searchParams;
  const c = await db.client.findUnique({
    where: { id },
    include: {
      plates: { orderBy: { activatedAt: "desc" }, include: { _count: { select: { taps: true } } } },
      sales: { orderBy: { createdAt: "desc" }, include: { client: true, seller: true, plates: true } },
    },
  });
  if (!c) notFound();
  const { plates, sales, ...client } = c;

  return (
    <div className="space-y-4">
      <Link href="/painel/clientes" className="text-sm font-semibold text-brand-600">← Clientes</Link>
      <h1 className="text-2xl font-extrabold">{c.name}</h1>
      {erro && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{erro}</p>}

      <h2 className="font-bold">Placas</h2>
      {plates.length === 0 && <p className="text-sm text-slate-500">Nenhuma placa.</p>}
      {plates.map((p) => (
        <Link key={p.id} href={`/p/${p.code}`} className="card flex items-center justify-between">
          <div>
            <p className="font-semibold">{p.kind ? `${KIND_EMOJI[p.kind]} ${KIND_LABEL[p.kind]}` : "—"}</p>
            <p className="text-xs text-slate-500">Placa {p.code} · {p._count.taps} toques</p>
          </div>
          <span className={`chip ${p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
            {p.status === "ACTIVE" ? "● Ativa" : "● Desativada"}
          </span>
        </Link>
      ))}

      <h2 className="pt-2 font-bold">Dados (o que as placas abrem)</h2>
      <EditClient c={client} />

      <h2 className="pt-2 font-bold">Vendas</h2>
      {sales.length === 0 && <p className="text-sm text-slate-500">Nenhuma venda.</p>}
      {sales.map((s) => (
        <SaleRow key={s.id} s={s} showSeller={user.role === "ADMIN"} isAdmin={user.role === "ADMIN"} />
      ))}
    </div>
  );
}
