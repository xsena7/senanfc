import Link from "next/link";
import { Copy, Heart } from "lucide-react";
import { CopyButton } from "./form-bits";
import { KindIcon } from "./icons";
import { Logo } from "./brand";
import { pixCopiaECola } from "@/lib/pix";
import { displayPixKey, PIX_KEY_LABEL, type PixKeyTypeT } from "@/lib/pix-key";
import { instagramUrl, whatsappUrl } from "@/lib/links";

export type PublicClient = {
  name: string;
  whatsapp: string | null;
  instagram: string | null;
  pixKey: string | null;
  pixKeyType: PixKeyTypeT | null;
  pixName: string | null;
  pixCity: string | null;
  googleUrl: string | null;
};

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="tech min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8">
        <div className="flex-1">{children}</div>
        <Link href="/" className="mt-12 flex items-center justify-center gap-2 text-xs text-white/40">
          tecnologia <Logo className="text-xs text-white/70" dark />
        </Link>
      </div>
    </main>
  );
}

export function StoreHeader({ name, label }: { name: string; label?: string }) {
  const initials = name.split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || name[0];
  return (
    <div className="text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 p-[2px] shadow-[0_0_40px_-5px_rgba(59,110,246,.6)]">
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0b0f1a] text-2xl font-extrabold text-white">{initials}</div>
      </div>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white">{name}</h1>
      {label && <p className="mt-1 text-sm text-white/50">{label}</p>}
    </div>
  );
}

export function PixPanel({ c }: { c: PublicClient & { pixKey: string; pixKeyType: PixKeyTypeT } }) {
  const code = pixCopiaECola({ key: c.pixKey, type: c.pixKeyType, name: c.pixName || c.name, city: c.pixCity || "Goiania" });
  return (
    <div className="glass space-y-4 p-5">
      <div className="flex items-center gap-3">
        <KindIcon kind="PIX" />
        <div>
          <p className="font-semibold text-white">Pague com Pix</p>
          <p className="text-xs text-white/50">Rápido, sem taxa, na hora</p>
        </div>
      </div>
      <div className="rounded-2xl border border-[#32BCAD]/30 bg-[#32BCAD]/10 p-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#5fe0d2]">Chave {PIX_KEY_LABEL[c.pixKeyType]}</p>
        <p className="mt-1 break-all font-mono text-lg font-bold text-white">{displayPixKey(c.pixKey, c.pixKeyType)}</p>
        {c.pixName && <p className="mt-1 text-sm text-white/60">{c.pixName}</p>}
      </div>
      <CopyButton
        text={code}
        label="Copiar Pix copia e cola"
        className="btn w-full bg-[#32BCAD] py-4 text-lg text-[#04221f] shadow-[0_10px_30px_-10px_#32BCAD] hover:bg-[#3fd0c0]"
      />
      <CopyButton text={c.pixKeyType === "PHONE" ? "+" + c.pixKey : c.pixKey} label="Copiar só a chave" className="btn w-full border border-white/15 bg-white/5 text-white hover:bg-white/10" />
      <ol className="grid grid-cols-3 gap-2 text-center text-[11px] text-white/60">
        <li className="rounded-xl bg-white/5 p-2"><Copy className="mx-auto mb-1 h-4 w-4 text-white/80" />Toque em copiar</li>
        <li className="rounded-xl bg-white/5 p-2"><span className="mx-auto mb-1 block text-sm font-bold text-white/80">2</span>Abra seu banco</li>
        <li className="rounded-xl bg-white/5 p-2"><span className="mx-auto mb-1 block text-sm font-bold text-white/80">3</span>Pix copia e cola</li>
      </ol>
    </div>
  );
}

export function PixView({ c }: { c: PublicClient & { pixKey: string; pixKeyType: PixKeyTypeT } }) {
  return (
    <PublicShell>
      <StoreHeader name={c.name} />
      <div className="mt-8">
        <PixPanel c={c} />
      </div>
    </PublicShell>
  );
}

export function KitView({ c }: { c: PublicClient }) {
  const links = [
    c.googleUrl && { href: c.googleUrl, kind: "GOOGLE" as const, title: "Avalie no Google", sub: "Deixe suas 5 estrelas ★★★★★" },
    c.instagram && { href: instagramUrl(c.instagram), kind: "INSTAGRAM" as const, title: "Siga no Instagram", sub: "@" + c.instagram },
    c.whatsapp && { href: whatsappUrl(c.whatsapp), kind: "WHATSAPP" as const, title: "Fale no WhatsApp", sub: "Atendimento direto" },
  ].filter(Boolean) as { href: string; kind: "GOOGLE" | "INSTAGRAM" | "WHATSAPP"; title: string; sub: string }[];
  return (
    <PublicShell>
      <StoreHeader name={c.name} label="Que bom ter você aqui" />
      <div className="mt-8 space-y-3">
        {links.map((l) => (
          <a key={l.kind} href={l.href} className="glass flex items-center gap-4 p-4 transition hover:bg-white/[0.08] active:scale-[.98]">
            <KindIcon kind={l.kind} size="lg" />
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-semibold text-white">{l.title}</span>
              <span className="block truncate text-sm text-white/50">{l.sub}</span>
            </span>
            <span className="text-white/30">›</span>
          </a>
        ))}
        {c.pixKey && c.pixKeyType && <PixPanel c={{ ...c, pixKey: c.pixKey, pixKeyType: c.pixKeyType }} />}
      </div>
      <p className="mt-8 flex items-center justify-center gap-1 text-sm text-white/40">
        Obrigado pela preferência <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
      </p>
    </PublicShell>
  );
}

export function NoticeView({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <PublicShell>
      <div className="glass mt-20 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-white/80">{icon}</div>
        <h1 className="mt-4 text-xl font-bold text-white">{title}</h1>
        <p className="mt-2 text-white/60">{text}</p>
      </div>
    </PublicShell>
  );
}
