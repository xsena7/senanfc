"use client";
import { useEffect, useState } from "react";
import { Download, Share, SquarePlus, X } from "lucide-react";

/** Registra o service worker (só em produção). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const KEY = "snfc_install_hide";

/** Cartão "Instale o app": botão no Android, passo a passo no iPhone. Some quando já está instalado. */
export function InstallCard() {
  const [mode, setMode] = useState<"" | "ios" | "android">("");
  const [evt, setEvt] = useState<BIPEvent | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    let hidden = false;
    try {
      hidden = localStorage.getItem(KEY) === "1";
    } catch {}
    if (standalone || hidden) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) setMode("ios");
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function hide() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setMode("");
  }

  if (!mode) return null;
  return (
    <div className="card relative border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-brand-500/10">
      <button onClick={hide} className="absolute right-2 top-2 rounded-lg p-1 text-white/40 hover:text-white" aria-label="Fechar">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" className="h-12 w-12 rounded-xl" />
        <div>
          <p className="font-bold text-white">Instale o app no celular</p>
          <p className="text-sm text-white/60">Ícone na tela, abre direto no painel.</p>
        </div>
      </div>
      {mode === "android" && evt && (
        <button
          onClick={async () => {
            await evt.prompt();
            await evt.userChoice;
            hide();
          }}
          className="btn-primary mt-3 w-full"
        >
          <Download className="h-5 w-5" /> Instalar
        </button>
      )}
      {mode === "ios" && (
        <ol className="mt-3 space-y-2 text-sm text-white/80">
          <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">1</span> Toque em <Share className="h-4 w-4 text-cyan-300" /> <b>Compartilhar</b> (no Safari)</li>
          <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">2</span> Escolha <SquarePlus className="h-4 w-4 text-cyan-300" /> <b>Adicionar à Tela de Início</b></li>
          <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">3</span> Toque em <b>Adicionar</b></li>
        </ol>
      )}
    </div>
  );
}
