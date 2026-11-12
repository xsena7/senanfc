import Link from "next/link";
import { db } from "@/lib/db";
import { changeKindAction, resetPlateAction, setPlateStatusAction } from "@/app/actions/plates";
import { KIND_LABEL, type PlateKindT } from "@/lib/catalog";
import { KindIcon } from "@/components/icons";
import { CircleCheck, Eye } from "lucide-react";
import { ConfirmButton } from "@/components/form-bits";

export async function ManagePlate({ code, justActivated, isAdmin }: { code: string; justActivated: boolean; isAdmin: boolean }) {
  const plate = await db.plate.findUniqueOrThrow({ where: { code }, include: { client: true, sale: { include: { _count: { select: { plates: true } } } } } });
  const week = new Date(Date.now() - 7 * 86400_000);
  const [taps, taps7] = await Promise.all([
    db.tap.count({ where: { plateId: plate.id } }),
    db.tap.count({ where: { plateId: plate.id, createdAt: { gte: week } } }),
  ]);
  const duoMissing = plate.sale?.product === "DUO" && plate.sale._count.plates < 2;

  return (
    <div className="space-y-4">
      {justActivated && (
        <div className="rounded-2xl bg-emerald-600 p-4 text-white">
          <p className="flex items-center gap-2 text-lg font-bold"><CircleCheck className="h-6 w-6" /> Placa ativada!</p>
          <p className="text-sm opacity-90">Toque em &quot;Testar&quot; para ver o que o cliente vai ver.</p>
          {duoMissing && <p className="mt-2 rounded-lg bg-white/20 p-2 text-sm font-semibold">Venda de 2 placas: agora encoste o celular na 2ª placa.</p>}
        </div>
      )}

      <div className="card space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">Placa {plate.code}</span>
          <span className={`chip ${plate.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
            {plate.status === "ACTIVE" ? "● Ativa" : "● Desativada"}
          </span>
        </div>
        {plate.kind && (
          <p className="flex items-center gap-3 text-2xl font-extrabold">
            <KindIcon kind={plate.kind} /> {KIND_LABEL[plate.kind]}
          </p>
        )}
        {plate.client && (
          <Link href={`/painel/clientes/${plate.client.id}`} className="block font-semibold text-brand-600">
            {plate.client.name} →
          </Link>
        )}
        <p className="text-sm text-slate-500">
          {taps} toques no total · {taps7} nos últimos 7 dias
        </p>
      </div>

      {plate.status === "ACTIVE" && (
        <a href={`/p/${plate.code}?ver=1`} className="btn-primary w-full py-4 text-lg">
          <Eye className="h-5 w-5" /> Testar (abrir como o cliente)
        </a>
      )}

      {plate.status === "ACTIVE" && (
        <form action={changeKindAction} className="card flex gap-2">
          <input type="hidden" name="plateId" value={plate.id} />
          <select name="kind" defaultValue={plate.kind ?? ""} className="input">
            {(Object.keys(KIND_LABEL) as PlateKindT[]).map((k) => (
              <option key={k} value={k}>
                {KIND_LABEL[k]}
              </option>
            ))}
          </select>
          <button className="btn-ghost shrink-0">Trocar</button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        <form action={setPlateStatusAction}>
          <input type="hidden" name="plateId" value={plate.id} />
          <input type="hidden" name="status" value={plate.status === "ACTIVE" ? "DISABLED" : "ACTIVE"} />
          {plate.status === "ACTIVE" ? (
            <ConfirmButton className="btn-danger btn-sm" message="Desativar a placa? Ela para de abrir até você reativar.">Desativar</ConfirmButton>
          ) : (
            <button className="btn-ghost btn-sm">Reativar</button>
          )}
        </form>
        {isAdmin && (
          <form action={resetPlateAction}>
            <input type="hidden" name="plateId" value={plate.id} />
            <ConfirmButton className="btn-ghost btn-sm" message="Zerar a placa? Ela volta a ser placa nova, sem cliente.">Zerar placa</ConfirmButton>
          </form>
        )}
        <Link href="/painel" className="btn-ghost btn-sm">Ir para o painel</Link>
      </div>
    </div>
  );
}
