import { Link2 } from "lucide-react";
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

/** Marca do Pix (losango de 4 pontas). */
export function PixMark({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden fill="currentColor">
      <path d="M34.6 34.2a5.6 5.6 0 0 1-4-1.65l-5.77-5.77a1.1 1.1 0 0 0-1.52 0l-5.79 5.79a5.6 5.6 0 0 1-4 1.65h-1.13l7.3 7.3a5.84 5.84 0 0 0 8.26 0l7.32-7.32z" />
      <path d="M13.53 13.78a5.6 5.6 0 0 1 4 1.65l5.79 5.79a1.07 1.07 0 0 0 1.52 0l5.77-5.77a5.6 5.6 0 0 1 4-1.65h.69l-7.32-7.32a5.84 5.84 0 0 0-8.26 0l-7.3 7.3z" />
      <path d="m41.54 19.87-4.42-4.42a.85.85 0 0 1-.31.06h-2.01a3.97 3.97 0 0 0-2.79 1.16l-5.77 5.77a2.76 2.76 0 0 1-3.9 0l-5.79-5.79a3.97 3.97 0 0 0-2.79-1.16h-2.47a.9.9 0 0 1-.3-.06l-4.44 4.44a5.84 5.84 0 0 0 0 8.26l4.44 4.44a.9.9 0 0 1 .3-.06h2.47a3.97 3.97 0 0 0 2.79-1.16l5.79-5.79a2.83 2.83 0 0 1 3.9 0l5.77 5.77a3.97 3.97 0 0 0 2.79 1.16h2.01a.85.85 0 0 1 .31.06l4.42-4.42a5.84 5.84 0 0 0 0-8.26z" />
    </svg>
  );
}

export function InstagramGlyph({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function WhatsappGlyph({ className = "h-5 w-5" }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2zm0 18.1a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.1.82.83-3.03-.2-.31a8.2 8.2 0 1 1 6.95 3.85zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.17.25-.64.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.44.25-.4.72-1.34.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.66.31 2.77 2.77 0 0 0-.86 2.06 4.8 4.8 0 0 0 1 2.55 11 11 0 0 0 4.21 3.72c1.57.68 2.18.73 2.97.62.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.47-.3z" />
    </svg>
  );
}

const TILE: Record<PlateKindT, string> = {
  PIX: "bg-[#32BCAD] text-white",
  GOOGLE: "bg-white",
  INSTAGRAM: "bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white",
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

