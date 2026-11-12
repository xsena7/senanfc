import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeCode } from "@/lib/codes";
import { brl, plural, startOfDayBR, startOfMonthBR } from "@/lib/format";
import { SaleRow } from "@/components/sale-row";

export const dynamic = "force-dynamic";

async function goToPlate(f: FormData) {
  "use server";
  const code = normalizeCode(String(f.get("code") ?? ""));
  if (code) redirect(`/p/${code}`);
}

export default async function PainelHome() {
  const user = await requireUser();
  const admin = user.role === "ADMIN";
  const mine = admin ? {} : { sellerId: user.id };
  const today = startOfDayBR();
  const month = startOfMonthBR();

  const [day, mon, pending, last, stock, tapsToday, bySeller] = await Promise.all([
    db.sale.aggregate({ where: { ...mine, createdAt: { gte: today } }, _sum: { priceCents: true }, _count: true }),
    db.sale.aggregate({ where: { ...mine, createdAt: { gte: month } }, _sum: { priceCents: true }, _count: true }),
    db.sale.aggregate({ where: { ...mine, payment: "PENDENTE" }, _sum: { priceCents: true }, _count: true }),
    db.sale.findMany({ where: mine, orderBy: { createdAt: "desc" }, take: 8, include: { client: true, seller: true, plates: true } }),
    admin ? db.plate.count({ where: { status: "BLANK" } }) : Promise.resolve(0),
    admin ? db.tap.count({ where: { createdAt: { gte: today } } }) : Promise.resolve(0),
    admin ? db.sale.groupBy({ by: ["sellerId"], where: { createdAt: { gte: month } }, _sum: { priceCents: true }, _count: true }) : Promise.resolve([]),
  ]);
  const sellers = admin ? await db.user.findMany({ where: { id: { in: bySeller.map((b) => b.sellerId) } } }) : [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-brand-600 p-5 text-white">
        <p className="text-lg font-bold">📲 Para vender</p>
        <p className="mt-1 text-sm opacity-90">Encoste o iPhone numa placa nova. Vai abrir a tela de ativar: escolha o que ela abre, preencha o cliente e pronto.</p>
        <form action={goToPlate} className="mt-3 flex gap-2">
          <input name="code" className="input bg-white text-slate-900" placeholder="Ou digite o código da placa" autoCapitalize="characters" />
          <button className="btn shrink-0 bg-white text-brand-700">Abrir</button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Hoje" value={brl(day._sum.priceCents ?? 0)} sub={plural(day._count, "venda", "vendas")} />
        <Stat label="Este mês" value={brl(mon._sum.priceCents ?? 0)} sub={plural(mon._count, "venda", "vendas")} />
        <Stat label="Fica devendo" value={brl(pending._sum.priceCents ?? 0)} sub={plural(pending._count, "venda", "vendas")} warn={pending._count > 0} />
        {admin && <Stat label="Placas novas em estoque" value={String(stock)} sub={`${tapsToday} toques hoje`} />}
      </div>

      {admin && bySeller.length > 0 && (
        <div className="card">
          <p className="mb-2 font-bold">Vendedores no mês</p>
          {bySeller.map((b) => (
            <div key={b.sellerId} className="flex justify-between border-t border-slate-100 py-2 text-sm first:border-0">
              <span>{sellers.find((s) => s.id === b.sellerId)?.name ?? "—"}</span>
              <span className="font-semibold">{brl(b._sum.priceCents ?? 0)} · {plural(b._count, "venda", "vendas")}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-bold">Últimas vendas</h2>
        <Link href="/painel/vendas" className="text-sm font-semibold text-brand-600">ver todas</Link>
      </div>
      {last.length === 0 && <p className="text-sm text-slate-500">Nenhuma venda ainda.</p>}
      {last.map((s) => (
        <SaleRow key={s.id} s={s} showSeller={admin} isAdmin={admin} />
      ))}
    </div>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string; sub: string; warn?: boolean }) {
  return (
    <div className={`card ${warn ? "border-amber-300 bg-amber-50" : ""}`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold">{value}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
}
