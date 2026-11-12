"use client";
import { useMemo, useState } from "react";
import { activatePlateAction } from "@/app/actions/plates";
import { ClientFields, type ClientValues } from "@/components/client-fields";
import { Msg } from "@/components/form-bits";
import { useKeepForm } from "@/components/use-form";
import { KIND_LABEL, PAYMENT_LABEL, PRODUCT_PRICE, type PaymentT, type PlateKindT } from "@/lib/catalog";
import { KindIcon } from "@/components/icons";
import { CircleCheck, Sparkles } from "lucide-react";

type OpenSale = { id: string; when: string; missing: number };
type C = ClientValues & { id: string; name: string; openSales: OpenSale[] };
type SaleKind = "SINGLE" | "DUO" | "KIT" | "JOIN" | "NONE";

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const FIELDS_FOR: Record<PlateKindT, ("PIX" | "GOOGLE" | "INSTAGRAM" | "WHATSAPP")[]> = {
  PIX: ["PIX"],
  GOOGLE: ["GOOGLE"],
  INSTAGRAM: ["INSTAGRAM"],
  WHATSAPP: ["WHATSAPP"],
  KIT: ["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP"],
};

function Choice({ on, onClick, title, sub, className = "", id }: { on: boolean; onClick: () => void; title: React.ReactNode; sub?: string; className?: string; id?: string }) {
  return (
    <button type="button" data-sale={id} onClick={onClick} className={`block w-full rounded-xl border-2 px-3 py-3 text-left ${on ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"} ${className}`}>
      <span className="block font-semibold">{title}</span>
      {sub && <span className="block text-sm text-slate-600">{sub}</span>}
    </button>
  );
}

export function ActivateForm({ code, clients }: { code: string; clients: C[] }) {
  const { state, onSubmit, pending } = useKeepForm(activatePlateAction);

  // Vendas de 2 placas que ainda esperam a 2ª (mais recente primeiro)
  const open = useMemo(
    () => clients.flatMap((c) => c.openSales.map((s) => ({ ...s, client: c }))).sort((a, b) => b.when.localeCompare(a.when)),
    [clients],
  );
  const recent = open.find((o) => Date.now() - new Date(o.when).getTime() < 3 * 3600_000);

  const [saleKind, setSaleKind] = useState<SaleKind | "">(recent ? "JOIN" : "");
  const [joinId, setJoinId] = useState(recent?.id ?? "");
  const [kind, setKindRaw] = useState<PlateKindT | "">("");
  const [mode, setMode] = useState<"new" | "old">("new");
  const [q, setQ] = useState("");
  const [clientId, setClientId] = useState("");
  const [payment, setPayment] = useState<PaymentT | "">("");

  const join = saleKind === "JOIN" ? open.find((o) => o.id === joinId) : undefined;
  const effKind: PlateKindT | "" = saleKind === "KIT" ? "KIT" : kind === "KIT" && saleKind !== "NONE" ? "" : kind;
  const client = join ? join.client : mode === "old" ? clients.find((c) => c.id === clientId) : undefined;
  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? clients.filter((c) => c.name.toLowerCase().includes(s)) : clients).slice(0, 8);
  }, [q, clients]);

  const step2 = saleKind !== "" && (saleKind !== "JOIN" || !!join);
  const step3 = step2 && effKind !== "";
  const needsPayment = saleKind === "SINGLE" || saleKind === "DUO" || saleKind === "KIT";
  const sale = saleKind === "JOIN" ? `join:${joinId}` : saleKind === "NONE" ? "none" : saleKind ? `new:${saleKind}` : "";
  const ready = step3 && (mode === "new" || !!client) && (!needsPayment || !!payment);

  let n = 0;
  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-10">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="kind" value={effKind} />
      <input type="hidden" name="clientId" value={client?.id ?? ""} />
      <input type="hidden" name="sale" value={sale} />
      <input type="hidden" name="payment" value={needsPayment ? payment : ""} />

      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 text-white shadow-lg"><Sparkles className="h-7 w-7" /></span>
        <h1 className="mt-1 text-2xl font-extrabold">Placa nova</h1>
        <p className="text-sm text-slate-500">Código {code}</p>
      </div>

      <section className="card space-y-2">
        <h2 className="font-bold">{++n}. O que você vendeu?</h2>
        {open.length > 0 && (
          <Choice id="JOIN" on={saleKind === "JOIN"} onClick={() => { setSaleKind("JOIN"); setJoinId(joinId || open[0].id); }} title="2ª placa de uma venda de 2" sub="Já cobrou na 1ª placa" />
        )}
        {saleKind === "JOIN" && open.length > 1 && (
          <div className="space-y-1 pl-3">
            {open.map((o) => (
              <Choice key={o.id} on={joinId === o.id} onClick={() => setJoinId(o.id)} title={o.client.name} sub={`Vendida ${when(o.when)}`} className="py-2" />
            ))}
          </div>
        )}
        {saleKind === "JOIN" && join && open.length === 1 && <p className="pl-3 text-sm font-semibold text-brand-700">Cliente: {join.client.name}</p>}
        <Choice id="SINGLE" on={saleKind === "SINGLE"} onClick={() => setSaleKind("SINGLE")} title="1 placa" sub={brl(PRODUCT_PRICE.SINGLE)} />
        <Choice id="DUO" on={saleKind === "DUO"} onClick={() => setSaleKind("DUO")} title="2 placas" sub={`${brl(PRODUCT_PRICE.DUO)} · depois encoste a 2ª placa`} />
        <Choice id="KIT" on={saleKind === "KIT"} onClick={() => setSaleKind("KIT")} title="Kit 4 links" sub={`${brl(PRODUCT_PRICE.KIT)} · 1 placa que abre Pix, Google, Instagram e WhatsApp`} />
        <Choice id="NONE" on={saleKind === "NONE"} onClick={() => setSaleKind("NONE")} title="Sem cobrança" sub="Troca de placa ou brinde" />
      </section>

      {step2 && saleKind !== "KIT" && (
        <section className="card space-y-2">
          <h2 className="font-bold">{++n}. O que essa placa abre?</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP", ...(saleKind === "NONE" ? ["KIT"] : [])] as PlateKindT[]).map((k) => (
              <button
                key={k}
                type="button"
                data-kind={k}
                onClick={() => setKindRaw(k)}
                className={`flex items-center gap-2 rounded-xl border-2 px-2 py-3 text-left font-semibold ${k === "KIT" ? "col-span-2" : ""} ${kind === k ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"}`}
              >
                <KindIcon kind={k} /> {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </section>
      )}

      {step3 && (
        <section className="card space-y-3">
          <h2 className="font-bold">{++n}. Cliente</h2>
          {!join && (
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              {(["new", "old"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-semibold ${mode === m ? "bg-white shadow" : "text-slate-500"}`}>
                  {m === "new" ? "Cliente novo" : "Já é cliente"}
                </button>
              ))}
            </div>
          )}
          {!join && mode === "old" && !client && (
            <div className="space-y-2">
              <input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Buscar pelo nome da loja" />
              {found.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente encontrado.</p>}
              {found.map((c) => (
                <button key={c.id} type="button" onClick={() => setClientId(c.id)} className="block w-full rounded-xl border border-slate-200 px-3 py-3 text-left font-semibold hover:bg-slate-50">
                  {c.name}
                </button>
              ))}
            </div>
          )}
          {!join && mode === "old" && client && (
            <button type="button" onClick={() => setClientId("")} className="text-sm font-semibold text-brand-600">
              ← trocar cliente
            </button>
          )}
          {(mode === "new" || client) && (
            <ClientFields key={`${client?.id ?? "novo"}-${effKind}`} v={client ?? {}} only={FIELDS_FOR[effKind as PlateKindT]} />
          )}
        </section>
      )}

      {step3 && needsPayment && (
        <section className="card space-y-2">
          <h2 className="font-bold">{++n}. Como pagou?</h2>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PAYMENT_LABEL) as PaymentT[]).map((p) => (
              <button
                key={p}
                type="button"
                data-pay={p}
                onClick={() => setPayment(p)}
                className={`rounded-xl border-2 px-2 py-3 font-semibold ${payment === p ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-700"}`}
              >
                {PAYMENT_LABEL[p]}
              </button>
            ))}
          </div>
        </section>
      )}

      <Msg state={state} />
      {step3 && (
        <button type="submit" disabled={pending || !ready} className="btn-primary w-full py-4 text-lg">
          {pending ? "Ativando..." : ready ? <><CircleCheck className="h-5 w-5" /> Ativar placa</> : needsPayment && !payment ? "Escolha como pagou" : "Escolha o cliente"}
        </button>
      )}
    </form>
  );
}
