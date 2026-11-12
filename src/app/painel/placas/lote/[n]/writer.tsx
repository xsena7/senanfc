"use client";
import { useEffect, useState } from "react";
import { markWrittenAction } from "@/app/actions/plates";
import { CopyButton } from "@/components/form-bits";

type P = { id: string; code: string; url: string; written: boolean; status: string; client: string | null };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function BatchWriter({ plates: initial }: { plates: P[] }) {
  const [plates, setPlates] = useState(initial);
  const [hasWebNfc, setHasWebNfc] = useState(false);
  const [lock, setLock] = useState(true);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => setHasWebNfc(typeof window !== "undefined" && "NDEFReader" in window), []);

  async function toggle(p: P) {
    const written = !p.written;
    setPlates((list) => list.map((x) => (x.id === p.id ? { ...x, written } : x)));
    await markWrittenAction(p.id, written);
  }

  // Android + Chrome: grava em sequência sozinho
  async function writeAll() {
    setBusy(true);
    try {
      const reader = new (window as any).NDEFReader();
      for (const p of plates.filter((x) => !x.written && x.status === "BLANK")) {
        setMsg(`Encoste a etiqueta da placa ${p.code}...`);
        await reader.write({ records: [{ recordType: "url", data: p.url }] });
        if (lock) await reader.makeReadOnly();
        await markWrittenAction(p.id, true);
        setPlates((list) => list.map((x) => (x.id === p.id ? { ...x, written: true } : x)));
        setMsg(`${p.code} gravada${lock ? " e travada" : ""}. Afaste e encoste a próxima.`);
        await new Promise((r) => setTimeout(r, 1500));
      }
      setMsg("Todas gravadas!");
    } catch (e: any) {
      setMsg("Parou: " + (e?.message ?? "erro ao gravar") + ". Toque em gravar de novo para continuar.");
    }
    setBusy(false);
  }

  const left = plates.filter((p) => !p.written && p.status === "BLANK").length;

  return (
    <div className="space-y-3">
      {hasWebNfc ? (
        <div className="card space-y-2">
          <p className="font-bold">Gravar com este celular</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Travar depois de gravar (recomendado)
          </label>
          <button onClick={writeAll} disabled={busy || left === 0} className="btn-primary w-full">
            {busy ? "Gravando..." : `Gravar ${left} etiquetas em sequência`}
          </button>
          {msg && <p className="text-sm font-medium">{msg}</p>}
        </div>
      ) : (
        <div className="card space-y-1 text-sm text-slate-600">
          <p className="font-bold text-slate-900">Como gravar no iPhone (NFC Tools)</p>
          <p>1. Toque em <b>Copiar</b> na placa abaixo.</p>
          <p>2. No NFC Tools: <b>Gravar → Adicionar registro → URL</b>, cole e confirme.</p>
          <p>3. Toque em <b>Gravar</b> e encoste a etiqueta.</p>
          <p>4. Depois: <b>Outros → Bloquear etiqueta</b> (trava para ninguém mudar).</p>
          <p>5. Volte aqui e marque <b>Gravada</b>. Cole o adesivo do código atrás da placa.</p>
        </div>
      )}
      <p className="text-sm text-slate-500">{left} para gravar de {plates.length}</p>
      {plates.map((p) => (
        <div key={p.id} className={`card flex items-center gap-2 ${p.written ? "opacity-60" : ""}`}>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-lg font-bold">{p.code}</p>
            <p className="truncate text-xs text-slate-500">{p.client ? `Ativa: ${p.client}` : p.url}</p>
          </div>
          <CopyButton text={p.url} label="Copiar" className="btn-ghost btn-sm" />
          <button onClick={() => toggle(p)} className={`btn-sm btn ${p.written ? "bg-emerald-100 text-emerald-700" : "border border-slate-300 bg-white"}`}>
            {p.written ? "Gravada" : "Gravada?"}
          </button>
        </div>
      ))}
    </div>
  );
}
