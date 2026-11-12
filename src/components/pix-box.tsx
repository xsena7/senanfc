import { CopyButton } from "./form-bits";
import { pixCopiaECola } from "@/lib/pix";
import { displayPixKey, PIX_KEY_LABEL, type PixKeyTypeT } from "@/lib/pix-key";

export function PixBox({ c }: { c: { name: string; pixKey: string; pixKeyType: PixKeyTypeT; pixName: string | null; pixCity: string | null } }) {
  const code = pixCopiaECola({ key: c.pixKey, type: c.pixKeyType, name: c.pixName || c.name, city: c.pixCity || "Goiania" });
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-emerald-50 p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Chave Pix · {PIX_KEY_LABEL[c.pixKeyType]}</p>
        <p className="mt-1 break-all text-xl font-bold text-slate-900">{displayPixKey(c.pixKey, c.pixKeyType)}</p>
        {c.pixName && <p className="mt-1 text-sm text-slate-600">{c.pixName}</p>}
      </div>
      <CopyButton text={code} label="📋 Copiar Pix (copia e cola)" className="btn w-full bg-emerald-600 py-4 text-lg text-white hover:bg-emerald-700" />
      <CopyButton text={c.pixKeyType === "PHONE" ? "+" + c.pixKey : c.pixKey} label="Copiar só a chave" className="btn-ghost w-full" />
      <ol className="space-y-1 text-sm text-slate-600">
        <li>1. Toque em <b>Copiar Pix</b></li>
        <li>2. Abra o app do seu banco</li>
        <li>3. Vá em <b>Pix → Pix Copia e Cola</b>, cole e coloque o valor</li>
      </ol>
    </div>
  );
}
