"use client";
import { useState } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { detectPixKeyType, displayPixKey, PIX_KEY_LABEL, type PixKeyTypeT } from "@/lib/pix-key";
import { instagramUrl, normalizeInstagram, normalizeWhatsapp, whatsappUrl } from "@/lib/links";
import { KindIcon } from "./icons";
import { GoogleField } from "./google-field";

export type ClientValues = {
  name?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  pixKey?: string | null;
  pixKeyType?: string | null;
  pixName?: string | null;
  pixCity?: string | null;
  googleUrl?: string | null;
  notes?: string | null;
};

type Key = "WHATSAPP" | "INSTAGRAM" | "PIX" | "GOOGLE" | "NOTES";
const ALL: Key[] = ["WHATSAPP", "INSTAGRAM", "PIX", "GOOGLE", "NOTES"];

/** Linha embaixo do campo: link pronto (com testar) ou aviso. */
function Preview({ ok, text, href, warn }: { ok: boolean; text: string; href?: string; warn?: string }) {
  if (ok)
    return (
      <div className="mt-1 flex items-center justify-between gap-2 text-xs">
        <span className="flex min-w-0 items-center gap-1 font-semibold text-emerald-700">
          <CircleCheck className="h-4 w-4 shrink-0" /> <span className="truncate">{text}</span>
        </span>
        {href && <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 font-semibold text-brand-600">testar ↗</a>}
      </div>
    );
  if (warn) return <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-800"><TriangleAlert className="h-4 w-4 shrink-0" /> {warn}</p>;
  return null;
}

function ZapField({ initial }: { initial: string }) {
  const [v, setV] = useState(initial);
  const n = normalizeWhatsapp(v);
  return (
    <div>
      <label className="label flex items-center gap-2"><KindIcon kind="WHATSAPP" size="sm" /> Número do WhatsApp</label>
      <input name="whatsapp" value={v} onChange={(e) => setV(e.target.value)} className="input" inputMode="tel" placeholder="(62) 99999-8888" />
      {v.trim() && <Preview ok={!!n} text={n ? `Link gerado: wa.me/${n}` : ""} href={n ? whatsappUrl(n) : undefined} warn="Coloque o número com DDD, ex.: (62) 99999-8888" />}
    </div>
  );
}

function InstaField({ initial }: { initial: string }) {
  const [v, setV] = useState(initial);
  const u = normalizeInstagram(v);
  return (
    <div>
      <label className="label flex items-center gap-2"><KindIcon kind="INSTAGRAM" size="sm" /> Instagram</label>
      <input name="instagram" value={v} onChange={(e) => setV(e.target.value)} className="input" autoCapitalize="none" autoCorrect="off" placeholder="@daloja ou cole o link do perfil" />
      {v.trim() ? (
        <Preview ok={!!u} text={u ? `Abre o perfil @${u}` : ""} href={u ? instagramUrl(u) : undefined} warn="Não reconheci. Coloque só o @ da loja." />
      ) : (
        <p className="mt-1 text-xs text-slate-500">Digite o @ ou, no Instagram da loja, toque em Compartilhar perfil → Copiar link e cole aqui.</p>
      )}
    </div>
  );
}

function PixField({ v }: { v: ClientValues }) {
  const startType = (v.pixKeyType as PixKeyTypeT | null) ?? null;
  const [key, setKey] = useState(v.pixKey && startType ? displayPixKey(v.pixKey, startType) : v.pixKey ?? "");
  const [pick, setPick] = useState<PixKeyTypeT | null>(null);
  const det = detectPixKeyType(key);
  const type = det.options ? (pick && det.options.includes(pick) ? pick : null) : det.type;
  return (
    <div className="space-y-3">
      <div>
        <label className="label flex items-center gap-2"><KindIcon kind="PIX" size="sm" /> Chave Pix</label>
        <input name="pixKey" value={key} onChange={(e) => setKey(e.target.value)} className="input" autoCapitalize="none" autoCorrect="off" placeholder="CPF, CNPJ, celular, e-mail ou aleatória" />
        <input type="hidden" name="pixKeyType" value={type ?? ""} />
        {key.trim() && det.options && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-slate-500">Essa chave é:</span>
            {det.options.map((t) => (
              <button key={t} type="button" onClick={() => setPick(t)} className={`rounded-lg border px-3 py-1.5 font-semibold ${type === t ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600"}`}>
                {PIX_KEY_LABEL[t]}
              </button>
            ))}
          </div>
        )}
        {key.trim() && !det.options && <Preview ok={!!type} text={type ? `Chave ${PIX_KEY_LABEL[type]}` : ""} warn="Não reconheci essa chave. Confira os números." />}
      </div>
      <div>
        <label className="label">Nome que aparece no Pix</label>
        <input name="pixName" defaultValue={v.pixName ?? ""} className="input" placeholder="Ex.: Padaria do Zé LTDA" />
      </div>
      <input type="hidden" name="pixCity" value={v.pixCity || "Goiânia"} />
    </div>
  );
}

/**
 * Campos do cliente. "only" mostra só o que a placa precisa; os outros ficam escondidos
 * (mas continuam sendo enviados com o valor atual, para não apagar nada do cliente).
 */
export function ClientFields({ v = {}, only, hideName }: { v?: ClientValues; only?: Key[]; hideName?: boolean }) {
  const [more, setMore] = useState(false);
  const show = (k: Key) => !only || more || only.includes(k);
  const hidden = ALL.filter((k) => !show(k));
  return (
    <div className="space-y-4">
      {hidden.includes("WHATSAPP") && <input type="hidden" name="whatsapp" value={v.whatsapp ?? ""} />}
      {hidden.includes("INSTAGRAM") && <input type="hidden" name="instagram" value={v.instagram ?? ""} />}
      {hidden.includes("GOOGLE") && <input type="hidden" name="googleUrl" value={v.googleUrl ?? ""} />}
      {hidden.includes("NOTES") && <input type="hidden" name="notes" value={v.notes ?? ""} />}
      {hidden.includes("PIX") && (
        <>
          <input type="hidden" name="pixKey" value={v.pixKey ?? ""} />
          <input type="hidden" name="pixKeyType" value={v.pixKeyType ?? ""} />
          <input type="hidden" name="pixName" value={v.pixName ?? ""} />
          <input type="hidden" name="pixCity" value={v.pixCity ?? ""} />
        </>
      )}
      {hideName ? (
        <input type="hidden" name="name" value={v.name ?? ""} />
      ) : (
        <div>
          <label className="label">Nome do estabelecimento *</label>
          <input name="name" defaultValue={v.name ?? ""} className="input" placeholder="Ex.: Padaria do Zé" required />
        </div>
      )}
      {show("PIX") && <PixField v={v} />}
      {show("WHATSAPP") && <ZapField initial={fmtZap(v.whatsapp)} />}
      {show("INSTAGRAM") && <InstaField initial={v.instagram ? "@" + v.instagram : ""} />}
      {show("GOOGLE") && <GoogleField initial={v.googleUrl ?? ""} />}
      {show("NOTES") && (
        <div>
          <label className="label">Observações</label>
          <input name="notes" defaultValue={v.notes ?? ""} className="input" placeholder="Endereço, falar com..." />
        </div>
      )}
      {only && !more && hidden.length > 0 && (
        <button type="button" onClick={() => setMore(true)} className="text-sm font-semibold text-brand-600">
          + Preencher outros dados (opcional)
        </button>
      )}
    </div>
  );
}

function fmtZap(n?: string | null) {
  if (!n) return "";
  const d = n.startsWith("55") ? n.slice(2) : n;
  return d.length === 11 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
