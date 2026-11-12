import { Link2 } from "lucide-react";
import { INSTAGRAM_PATH, PIX_PATH, WHATSAPP_PATH } from "./brand-paths";
import type { PlateKindT } from "@/lib/catalog";

type P = { className?: string };

export function GoogleG({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/** Marca do Pix (oficial). */
export function PixMark({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={PIX_PATH} />
    </svg>
  );
}

export function InstagramGlyph({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={INSTAGRAM_PATH} />
    </svg>
  );
}

export function WhatsappGlyph({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d={WHATSAPP_PATH} />
    </svg>
  );
}

const TILE: Record<PlateKindT, string> = {
  PIX: "bg-[#fff] text-[#32BCAD]",
  GOOGLE: "bg-[#fff]",
  INSTAGRAM: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] text-white",
  WHATSAPP: "bg-[#25D366] text-white",
  KIT: "bg-gradient-to-br from-brand-500 to-cyan-400 text-white",
};

/** Ícone de cada tipo de placa, num quadradinho com a cor da marca. */
export function KindIcon({ kind, size = "md" }: { kind: PlateKindT; size?: "sm" | "md" | "lg" }) {
  const box = size === "sm" ? "h-6 w-6 rounded-md" : size === "lg" ? "h-12 w-12 rounded-2xl" : "h-9 w-9 rounded-xl";
  const ico = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span className={`inline-flex shrink-0 items-center justify-center shadow-sm ring-1 ring-black/5 ${box} ${TILE[kind]}`}>
      {kind === "PIX" && <PixMark className={ico} />}
      {kind === "GOOGLE" && <GoogleG className={ico} />}
      {kind === "INSTAGRAM" && <InstagramGlyph className={ico} />}
      {kind === "WHATSAPP" && <WhatsappGlyph className={ico} />}
      {kind === "KIT" && <Link2 className={ico} />}
    </span>
  );
}

