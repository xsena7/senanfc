"use client";
import { useState } from "react";
import { PIX_KEY_LABEL, type PixKeyTypeT } from "@/lib/pix-key";

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

/** Campos do cliente. "focus" destaca o campo que a placa escolhida precisa. */
export function ClientFields({ v = {}, focus }: { v?: ClientValues; focus?: string }) {
  const [pixType, setPixType] = useState<string>(v.pixKeyType ?? "");
  const hi = (k: string) => (focus === k || (focus === "KIT") ? "ring-2 ring-brand-100 rounded-xl" : "");
  return (
    <div className="space-y-3">
      <div>
        <label className="label">Nome da loja *</label>
        <input name="name" defaultValue={v.name ?? ""} className="input" placeholder="Ex.: Padaria do Zé" required />
      </div>
      <div className={hi("WHATSAPP")}>
        <label className="label">💬 WhatsApp da loja</label>
        <input name="whatsapp" defaultValue={fmtZap(v.whatsapp)} className="input" inputMode="tel" placeholder="(62) 99999-8888" />
      </div>
      <div className={hi("INSTAGRAM")}>
        <label className="label">📸 Instagram</label>
        <input name="instagram" defaultValue={v.instagram ? "@" + v.instagram : ""} className="input" autoCapitalize="none" autoCorrect="off" placeholder="@padariadoze" />
      </div>
      <div className={`space-y-2 ${hi("PIX")}`}>
        <label className="label">💠 Chave Pix</label>
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
      </div>
      <div className={hi("GOOGLE")}>
        <label className="label">⭐ Link de avaliação do Google</label>
        <input name="googleUrl" defaultValue={v.googleUrl ?? ""} className="input" autoCapitalize="none" autoCorrect="off" inputMode="url" placeholder="https://g.page/r/.../review" />
        <p className="mt-1 text-xs text-slate-500">O dono pega no Google: Perfil da Empresa → &quot;Pedir avaliações&quot; → copiar link.</p>
      </div>
      <div>
        <label className="label">Observações</label>
        <input name="notes" defaultValue={v.notes ?? ""} className="input" placeholder="Endereço, falar com..." />
      </div>
    </div>
  );
}

function fmtZap(n?: string | null) {
  if (!n) return "";
  const d = n.startsWith("55") ? n.slice(2) : n;
  return d.length === 11 ? d.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : d.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
