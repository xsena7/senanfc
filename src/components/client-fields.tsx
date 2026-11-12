"use client";
import { useState } from "react";
import { PIX_KEY_LABEL, type PixKeyTypeT } from "@/lib/pix-key";
import { KindIcon } from "./icons";

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

/**
 * Campos do cliente. "only" mostra só o que a placa precisa; os outros ficam escondidos
 * (mas continuam sendo enviados com o valor atual, para não apagar nada do cliente).
 */
export function ClientFields({ v = {}, only, hideName }: { v?: ClientValues; only?: Key[]; hideName?: boolean }) {
  const [pixType, setPixType] = useState<string>(v.pixKeyType ?? "");
  const [more, setMore] = useState(false);
  const show = (k: Key) => !only || more || only.includes(k);
  const hidden = ALL.filter((k) => !show(k));
  return (
    <div className="space-y-3">
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
      {show("WHATSAPP") && <div>
        <label className="label flex items-center gap-2"><KindIcon kind="WHATSAPP" size="sm" /> WhatsApp da loja</label>
        <input name="whatsapp" defaultValue={fmtZap(v.whatsapp)} className="input" inputMode="tel" placeholder="(62) 99999-8888" />
      </div>}
      {show("INSTAGRAM") && <div>
        <label className="label flex items-center gap-2"><KindIcon kind="INSTAGRAM" size="sm" /> Instagram</label>
        <input name="instagram" defaultValue={v.instagram ? "@" + v.instagram : ""} className="input" autoCapitalize="none" autoCorrect="off" placeholder="@padariadoze" />
      </div>}
      {show("PIX") && <div className="space-y-2">
        <label className="label flex items-center gap-2"><KindIcon kind="PIX" size="sm" /> Chave Pix</label>
        <div className="grid grid-cols-5 gap-1">
          {(Object.keys(PIX_KEY_LABEL) as PixKeyTypeT[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setPixType(t)}
              className={`rounded-lg border px-1 py-2 text-xs font-semibold ${pixType === t ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-300 bg-white text-slate-600"}`}
            >
              {t === "RANDOM" ? "Aleatória" : PIX_KEY_LABEL[t]}
            </button>
          ))}
        </div>
        <input type="hidden" name="pixKeyType" value={pixType} />
        <input
          name="pixKey"
          defaultValue={v.pixKey ?? ""}
          className="input"
          autoCapitalize="none"
          autoCorrect="off"
          inputMode={pixType === "EMAIL" || pixType === "RANDOM" || !pixType ? "text" : "numeric"}
          placeholder={pixType ? `Chave (${PIX_KEY_LABEL[pixType as PixKeyTypeT]})` : "Escolha o tipo acima"}
        />
        <div className="grid grid-cols-2 gap-2">
          <input name="pixName" defaultValue={v.pixName ?? ""} className="input" placeholder="Nome de quem recebe" />
          <input name="pixCity" defaultValue={v.pixCity ?? "Goiânia"} className="input" placeholder="Cidade" />
        </div>
      </div>}
      {show("GOOGLE") && <div>
        <label className="label flex items-center gap-2"><KindIcon kind="GOOGLE" size="sm" /> Link de avaliação do Google</label>
        <input name="googleUrl" defaultValue={v.googleUrl ?? ""} className="input" autoCapitalize="none" autoCorrect="off" inputMode="url" placeholder="https://g.page/r/.../review" />
        <p className="mt-1 text-xs text-slate-500">O dono pega no Google: Perfil da Empresa → &quot;Pedir avaliações&quot; → copiar link.</p>
      </div>}
      {show("NOTES") && <div>
        <label className="label">Observações</label>
        <input name="notes" defaultValue={v.notes ?? ""} className="input" placeholder="Endereço, falar com..." />
      </div>}
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
