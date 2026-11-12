import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { brl, plural, startOfDayBR, startOfMonthBR } from "@/lib/format";
import { SaleRow } from "@/components/sale-row";

export const dynamic = "force-dynamic";

const PERIODS = { hoje: "Hoje", mes: "Mês", devendo: "Devendo", tudo: "Tudo" } as const;

export default async function Vendas({ searchParams }: { searchParams: Promise<{ p?: string; v?: string }> }) {
  const user = await requireUser();
  const admin = user.role === "ADMIN";
  const sp = await searchParams;
  const p = (sp.p && sp.p in PERIODS ? sp.p : "mes") as keyof typeof PERIODS;
  const where = {
    ...(admin ? (sp.v ? { sellerId: sp.v } : {}) : { sellerId: user.id }),
    ...(p === "hoje" ? { createdAt: { gte: startOfDayBR() } } : p === "mes" ? { createdAt: { gte: startOfMonthBR() } } : {}),
    ...(p === "devendo" ? { payment: "PENDENTE" as const } : {}),
  };
  const [sales, sum, sellers] = await Promise.all([
    db.sale.findMany({ where, orderBy: { createdAt: "desc" }, take: 300, include: { client: true, seller: true, plates: true } }),
    db.sale.aggregate({ where, _sum: { priceCents: true }, _count: true }),
    admin ? db.user.findMany({ orderBy: { name: "asc" } }) : Promise.resolve([]),
  ]);
  const q = (o: Record<string, string | undefined>) => "?" + new URLSearchParams(Object.entries({ p, v: sp.v, ...o }).filter(([, x]) => x) as [string, string][]).toString();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Vendas</h1>
      <div className="flex gap-1 rounded-xl bg-slate-200/60 p-1">
        {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((k) => (
          <Link key={k} href={q({ p: k })} className={`flex-1 rounded-lg py-2 text-center text-sm font-semibold ${p === k ? "bg-white shadow" : "text-slate-500"}`}>
            {PERIODS[k]}
          </Link>
        ))}
      </div>
      {admin && sellers.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Link href={q({ v: "" })} className={`chip px-3 py-1 ${!sp.v ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}>Todos</Link>
          {sellers.map((s) => (
            <Link key={s.id} href={q({ v: s.id })} className={`chip px-3 py-1 ${sp.v === s.id ? "bg-brand-600 text-white" : "bg-white text-slate-600"}`}>{s.name.split(" ")[0]}</Link>
          ))}
        </div>
      )}
      <div className="card flex items-center justify-between">
        <span className="text-slate-500">{plural(sum._count, "venda", "vendas")}</span>
        <span className="text-2xl font-extrabold">{brl(sum._sum.priceCents ?? 0)}</span>
      </div>
      {sales.map((s) => (
        <SaleRow key={s.id} s={s} showSeller={admin} isAdmin={admin} />
      ))}
    </div>
  );
}
