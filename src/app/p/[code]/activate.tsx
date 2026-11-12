"use client";
import { useMemo, useState } from "react";
import { CircleCheck, Sparkles, Store, X } from "lucide-react";
import { activatePlateAction } from "@/app/actions/plates";
import { ClientFields, type ClientValues } from "@/components/client-fields";
import { KindIcon } from "@/components/icons";
import { Msg } from "@/components/form-bits";
import { useKeepForm } from "@/components/use-form";
import { KIND_LABEL, type PlateKindT } from "@/lib/catalog";

type C = ClientValues & { id: string; name: string; plates: { code: string; kind: PlateKindT | null; off: boolean }[] };

const KINDS: PlateKindT[] = ["INSTAGRAM", "WHATSAPP", "GOOGLE", "PIX", "KIT"];
const FIELDS_FOR: Record<PlateKindT, ("PIX" | "GOOGLE" | "INSTAGRAM" | "WHATSAPP")[]> = {
  PIX: ["PIX"],
  GOOGLE: ["GOOGLE"],
  INSTAGRAM: ["INSTAGRAM"],
  WHATSAPP: ["WHATSAPP"],
  KIT: ["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP"],
};
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export function ActivateForm({ code, clients }: { code: string; clients: C[] }) {
  const { state, onSubmit, pending } = useKeepForm(activatePlateAction);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [focus, setFocus] = useState(false);
  const [kind, setKind] = useState<PlateKindT | "">("");

  const client = clients.find((c) => c.id === clientId);
  const matches = useMemo(() => {
    const q = fold(name);
    if (!q) return clients.slice(0, 6);
    return clients.filter((c) => fold(c.name).includes(q)).slice(0, 6);
  }, [name, clients]);

  function pick(c: C) {
    setClientId(c.id);
    setName(c.name);
    setFocus(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-10">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="clientId" value={client?.id ?? ""} />

      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 text-white shadow-lg">
          <Sparkles className="h-7 w-7" />
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">Placa nova</h1>
        <p className="font-mono text-sm font-semibold text-brand-600">{code}</p>
      </div>

      {/* 1. Estabelecimento */}
      <section className="card space-y-2">
        <h2 className="font-bold">1. Estabelecimento</h2>
        {client ? (
          <div className="rounded-xl border-2 border-brand-600 bg-brand-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 font-bold"><Store className="h-4 w-4 text-brand-600" /> {client.name}</p>
                <p className="text-xs text-slate-500">Já cadastrado · {client.plates.length ? `${client.plates.length} placa(s)` : "sem placas"}</p>
              </div>
              <button type="button" onClick={() => { setClientId(""); setName(""); }} className="rounded-lg p-1 text-slate-500 hover:bg-white" aria-label="Trocar">
                <X className="h-5 w-5" />
              </button>
            </div>
            {client.plates.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {client.plates.map((p) => (
                  <span key={p.code} className={`flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-semibold ${p.off ? "opacity-40" : ""}`}>
                    {p.kind && <KindIcon kind={p.kind} size="sm" />} {p.code}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setFocus(true); }}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              className="input"
              placeholder="Nome do estabelecimento"
              autoComplete="off"
            />
            {focus && matches.length > 0 && (
              <div className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Já cadastrados</p>
                {matches.map((c) => (
                  <button key={c.id} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(c)} className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left hover:bg-slate-50">
                    <span className="font-semibold">{c.name}</span>
                    <span className="flex gap-1">{c.plates.map((p) => p.kind && <KindIcon key={p.code} kind={p.kind} size="sm" />)}</span>
                  </button>
                ))}
              </div>
            )}
            {name.trim() && <p className="mt-1 text-xs text-slate-500">Não achou na lista? Segue que ele é cadastrado como novo.</p>}
          </div>
        )}
      </section>

      {/* 2. Do que é a placa */}
      <section className="card space-y-2">
        <h2 className="font-bold">2. A placa vai ser do quê?</h2>
        <div className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              data-kind={k}
              onClick={() => setKind(k)}
              className={`flex items-center gap-2 rounded-xl border-2 px-2 py-3 text-left font-semibold ${k === "KIT" ? "col-span-2" : ""} ${kind === k ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white"}`}
            >
              <KindIcon kind={k} />
              <span>
                {KIND_LABEL[k]}
                {k === "KIT" && <span className="block text-xs font-normal text-slate-500">Pix, Google, Instagram e WhatsApp numa placa</span>}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Links */}
      {kind && (name.trim() || client) && (
        <section className="card space-y-3">
          <h2 className="font-bold">3. Configure {kind === "KIT" ? "os links" : "o link"}</h2>
          <ClientFields key={`${client?.id ?? "novo"}-${kind}`} v={{ ...(client ?? {}), name: client?.name ?? name }} only={FIELDS_FOR[kind]} hideName />
        </section>
      )}

      <Msg state={state} />
      <button type="submit" disabled={pending || !kind || !(name.trim() || client)} className="btn-primary w-full py-4 text-lg">
        {pending ? "Ativando..." : !(name.trim() || client) ? "Coloque o estabelecimento" : !kind ? "Escolha do que é a placa" : <><CircleCheck className="h-5 w-5" /> Ativar placa</>}
      </button>
    </form>
  );
}
