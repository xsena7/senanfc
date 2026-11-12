import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { dateOnly } from "@/lib/format";
import { BatchForm } from "./batch-form";

export const dynamic = "force-dynamic";

export default async function Placas() {
  await requireAdmin();
  const [byStatus, batches, notWritten] = await Promise.all([
    db.plate.groupBy({ by: ["status"], _count: true }),
    db.plate.groupBy({ by: ["batch"], _count: true, _min: { createdAt: true }, orderBy: { batch: "desc" } }),
    db.plate.groupBy({ by: ["batch"], where: { writtenAt: null, status: "BLANK" }, _count: true }),
  ]);
  const n = (s: string) => byStatus.find((b) => b.status === s)?._count ?? 0;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Placas</h1>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="card"><p className="text-2xl font-extrabold">{n("BLANK")}</p><p className="text-xs text-slate-500">Novas</p></div>
        <div className="card"><p className="text-2xl font-extrabold text-emerald-600">{n("ACTIVE")}</p><p className="text-xs text-slate-500">Ativas</p></div>
        <div className="card"><p className="text-2xl font-extrabold text-slate-400">{n("DISABLED")}</p><p className="text-xs text-slate-500">Desativadas</p></div>
      </div>
      <div className="card space-y-2">
        <p className="font-bold">Gerar lote de placas</p>
        <p className="text-sm text-slate-500">O sistema cria um link único para cada placa. Depois você grava cada link numa etiqueta (NFC Tools) e trava.</p>
        <BatchForm />
      </div>
      <h2 className="font-bold">Lotes</h2>
      {batches.length === 0 && <p className="text-sm text-slate-500">Nenhum lote ainda.</p>}
      {batches.map((b) => {
        const left = notWritten.find((x) => x.batch === b.batch)?._count ?? 0;
        return (
          <Link key={b.batch} href={`/painel/placas/lote/${b.batch}`} className="card flex items-center justify-between">
            <div>
              <p className="font-semibold">Lote {b.batch}</p>
              <p className="text-xs text-slate-500">{b._count} placas · {b._min.createdAt ? dateOnly(b._min.createdAt) : ""}</p>
            </div>
            {left > 0 ? <span className="chip bg-amber-100 text-amber-800">{left} para gravar</span> : <span className="chip bg-emerald-100 text-emerald-700">gravado</span>}
          </Link>
        );
      })}
    </div>
  );
}
