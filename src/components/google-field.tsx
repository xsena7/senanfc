"use client";
import { useEffect, useRef, useState } from "react";
import { CircleCheck, ClipboardPaste, ExternalLink, LoaderCircle, TriangleAlert } from "lucide-react";
import { KindIcon } from "./icons";
import { googleLinkKind } from "@/lib/google-link";
import { resolveGoogleLinkAction } from "@/app/actions/google";

// Plano B, só aparece se não der para gerar sozinho
const GENERATOR = "https://productmate.com/pt-br/gerador-de-link-de-avaliacao-google";

/** Campo do Google: cola o link do Google Maps e ele vira o link de avaliação sozinho. */
export function GoogleField({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const last = useRef("");
  const kind = googleLinkKind(value);

  useEffect(() => {
    const v = value.trim();
    if (!v || kind !== "other" || v === last.current) return;
    const t = setTimeout(async () => {
      last.current = v;
      setBusy(true);
      setError("");
      try {
        const r = await resolveGoogleLinkAction(v);
        if ("url" in r) setValue(r.url);
        else setError(r.error);
      } catch {
        setError("Não deu certo agora. Tente de novo.");
      }
      setBusy(false);
    }, 500);
    return () => clearTimeout(t);
  }, [value, kind]);

  async function paste() {
    try {
      const t = (await navigator.clipboard.readText()).trim();
      if (t) setValue(t);
      else setHint("Nada copiado ainda.");
    } catch {
      setHint("Toque e segure no campo e escolha Colar.");
    }
    setTimeout(() => setHint(""), 3000);
  }

  return (
    <div className="space-y-2">
      <label className="label flex items-center gap-2">
        <KindIcon kind="GOOGLE" size="sm" /> Google (avaliação)
      </label>
      <div className="flex gap-2">
        <input
          name="googleUrl"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          className="input"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode="url"
          placeholder="Cole o link do Google Maps da loja"
        />
        <button type="button" onClick={paste} className="btn-ghost shrink-0 px-3" aria-label="Colar">
          <ClipboardPaste className="h-5 w-5" />
        </button>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {busy && (
        <p className="flex items-center gap-1 text-xs font-semibold text-brand-600">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Gerando o link de avaliação...
        </p>
      )}
      {!busy && kind === "review" && (
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <CircleCheck className="h-4 w-4" /> Link de avaliação pronto
          </p>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-600">testar ↗</a>
        </div>
      )}
      {!busy && error && (
        <div className="space-y-2">
          <p className="flex items-start gap-1 text-xs font-semibold text-amber-800">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </p>
          <a href={GENERATOR} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-sm w-full">
            <ExternalLink className="h-4 w-4" /> Gerar pelo site gratuito
          </a>
        </div>
      )}
      {!value && <p className="text-xs text-slate-500">No Google Maps: abra a loja → Compartilhar → Copiar link. Depois toque no botão de colar.</p>}
    </div>
  );
}
