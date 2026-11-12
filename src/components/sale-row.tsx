import Link from "next/link";
import { brl, dateTime } from "@/lib/format";
import { KIND_EMOJI, PAYMENT_LABEL, PRODUCT_LABEL } from "@/lib/catalog";
import { deleteSaleAction, markPaidAction } from "@/app/actions/sales";
import { ConfirmButton } from "./form-bits";
import type { Prisma } from "@prisma/client";

export type SaleFull = Prisma.SaleGetPayload<{ include: { client: true; seller: true; plates: true } }>;

export function SaleRow({ s, showSeller, isAdmin }: { s: SaleFull; showSeller: boolean; isAdmin: boolean }) {
  return (
    <div className="card space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/painel/clientes/${s.client.id}`} className="font-semibold">{s.client.name}</Link>
          <p className="text-sm text-slate-500">
            {PRODUCT_LABEL[s.product]} {s.plates.map((p) => (p.kind ? KIND_EMOJI[p.kind] : "")).join(" ")} · {dateTime(s.createdAt)}
            {showSeller && ` · ${s.seller.name.split(" ")[0]}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">{brl(s.priceCents)}</p>
          <span className={`chip ${s.payment === "PENDENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{PAYMENT_LABEL[s.payment]}</span>
        </div>
      </div>
      {(s.payment === "PENDENTE" || isAdmin) && (
        <div className="flex flex-wrap items-center gap-2">
          {s.payment === "PENDENTE" &&
            (["PIX", "DINHEIRO", "CARTAO"] as const).map((p) => (
              <form key={p} action={markPaidAction}>
                <input type="hidden" name="saleId" value={s.id} />
                <input type="hidden" name="payment" value={p} />
                <button className="btn-ghost btn-sm">Recebi no {PAYMENT_LABEL[p].toLowerCase()}</button>
              </form>
            ))}
          {isAdmin && (
            <form action={deleteSaleAction} className="ml-auto">
              <input type="hidden" name="saleId" value={s.id} />
              <ConfirmButton className="text-xs font-semibold text-red-500" message="Apagar essa venda? As placas continuam funcionando.">apagar</ConfirmButton>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
