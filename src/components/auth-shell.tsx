import { LogoMark } from "./brand";

/** Fundo da tela de login/primeiro acesso: escuro, com o logo pulsando. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <main className="tech panel flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <span className="nfc-ring absolute inset-0 rounded-full border-2 border-cyan-300/40" />
          <span className="nfc-ring absolute inset-0 rounded-full border-2 border-cyan-300/40 [animation-delay:1.2s]" />
          <LogoMark className="relative h-16 w-16 drop-shadow-[0_0_25px_rgba(34,211,238,.6)]" />
        </div>
        <h1 className="text-center text-2xl font-extrabold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-center text-sm text-white/55">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        <p className="mt-8 text-center text-xs text-white/30">Sena<span className="text-cyan-300/70">NFC</span> · painel</p>
      </div>
    </main>
  );
}
