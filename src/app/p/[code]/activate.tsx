"use client";
import { useMemo, useState } from "react";
import { activatePlateAction } from "@/app/actions/plates";
import { ClientFields, type ClientValues } from "@/components/client-fields";
import { Msg } from "@/components/form-bits";
import { useKeepForm } from "@/components/use-form";
import { KIND_EMOJI, KIND_LABEL, PAYMENT_LABEL, PRODUCT_PRICE, type PaymentT, type PlateKindT } from "@/lib/catalog";

type C = ClientValues & { id: string; name: string; openSales: { id: string; when: string; missing: number }[] };

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

export function ActivateForm({ code, clients }: { code: string; clients: C[] }) {
  const { state, onSubmit, pending } = useKeepForm(activatePlateAction);
  const [kind, setKind] = useState<PlateKindT | "">("");
  const [mode, setMode] = useState<"new" | "old">("new");
  const [q, setQ] = useState("");
  const [clientId, setClientId] = useState("");
  const [sale, setSale] = useState("");
  const [payment, setPayment] = useState<PaymentT | "">("");

  const client = mode === "old" ? clients.find((c) => c.id === clientId) : undefined;
  const found = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? clients.filter((c) => c.name.toLowerCase().includes(s)) : clients).slice(0, 8);
  }, [q, clients]);

  // Opções de venda conforme a placa e o cliente
  const options: { value: string; title: string; sub?: string }[] = [];
  for (const s of client?.openSales ?? []) options.push({ value: `join:${s.id}`, title: "Faz parte da venda de 2 placas", sub: `Vendida em ${day(s.when)} · falta ${s.missing}` });
  if (kind === "KIT") options.push({ value: "new:KIT", title: "Kit 4 links", sub: brl(PRODUCT_PRICE.KIT) });
  else {
    options.push({ value: "new:SINGLE", title: "1 placa", sub: brl(PRODUCT_PRICE.SINGLE) });
    options.push({ value: "new:DUO", title: "2 placas", sub: `${brl(PRODUCT_PRICE.DUO)} · depois encoste a 2ª placa` });
  }
  options.push({ value: "none", title: "Sem cobrança", sub: "Troca de placa ou brinde" });
  const saleValue = options.some((o) => o.value === sale) ? sale : options[0].value;

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-10">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="clientId" value={client?.id ?? ""} />
      <input type="hidden" name="sale" value={saleValue} />
      <input type="hidden" name="payment" value={payment} />

      <div className="text-center">
        <p className="text-4xl">✨</p>
        <h1 className="mt-1 text-2xl font-extrabold">Placa nova</h1>
        <p className="text-sm text-slate-500">Código {code} · preencha e ative</p>
      </div>

      <section className="card space-y-3">
        <h2 className="font-bold">1. O que essa placa vai abrir?</h2>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(KIND_LABEL) as PlateKindT[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-xl border-2 px-2 py-3 text-left font-semibold ${k === "KIT" ? "col-span-2" : ""} ${kind === k ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <span className="text-xl">{KIND_EMOJI[k]}</span> {KIND_LABEL[k]}
              {k === "KIT" && <span className="block text-xs font-normal text-slate-500">Página da loja com Pix, Google, Instagram e WhatsApp</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">2. Cliente</h2>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {(["new", "old"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-lg py-2 text-sm font-semibold ${mode === m ? "bg-white shadow" : "text-slate-500"}`}>
              {m === "new" ? "Cliente novo" : "Já é cliente"}
            </button>
          ))}
        </div>
        {mode === "old" && !client && (
          <div className="space-y-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} className="input" placeholder="Buscar pelo nome da loja" />
            {found.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente encontrado.</p>}
            {found.map((c) => (
              <button key={c.id} type="button" onClick={() => setClientId(c.id)} className="block w-full rounded-xl border border-slate-200 px-3 py-3 text-left font-semibold hover:bg-slate-50">
                {c.name}
                {c.openSales.length > 0 && <span className="chip ml-2 bg-amber-100 text-amber-800">falta placa</span>}
              </button>
            ))}
          </div>
        )}
        {mode === "old" && client && (
          <button type="button" onClick={() => setClientId("")} className="text-sm font-semibold text-brand-600">
            ← trocar cliente
          </button>
        )}
        {(mode === "new" || client) && <ClientFields key={client?.id ?? "novo"} v={client ?? {}} focus={kind || undefined} />}
      </section>

      <section className="card space-y-3">
        <h2 className="font-bold">3. Venda</h2>
        <div className="space-y-2">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setSale(o.value)}
              className={`block w-full rounded-xl border-2 px-3 py-3 text-left ${saleValue === o.value ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <span className="block font-semibold">{o.title}</span>
              {o.sub && <span className="block text-sm text-slate-600">{o.sub}</span>}
            </button>
          ))}
        </div>
        {saleValue.startsWith("new:") && (
          <div>
            <p className="label">Como pagou?</p>
            <div className="grid grid-cols-4 gap-1">
              {(Object.keys(PAYMENT_LABEL) as PaymentT[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPayment(p)}
                  className={`rounded-lg border px-1 py-2 text-xs font-semibold ${payment === p ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-300 bg-white text-slate-600"}`}
                >
                  {PAYMENT_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <Msg state={state} />
      <button type="submit" disabled={pending || !kind} className="btn-primary w-full py-4 text-lg">
        {pending ? "Ativando..." : kind ? "✅ Ativar placa" : "Escolha o que a placa abre"}
      </button>
    </form>
  );
}
