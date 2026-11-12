import { randomInt } from "node:crypto";

// Placas novas: SNFC1, SNFC2, ... (senanfc.com.br/SNFC1). Códigos antigos aleatórios seguem em /p/<código>.
export const PREFIX = "SNFC";
const SEQ_RE = /^SNFC(\d+)$/;

// Sem letras/números que confundem (0/O, 1/I/L) — só para os códigos antigos
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function newCode(len = 6): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

/** Aceita "snfc 7", "SNFC7", "7" (vira SNFC7) ou um código antigo. */
export function normalizeCode(raw: string): string {
  const s = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return /^\d+$/.test(s) ? PREFIX + Number(s) : s.replace(/^SNFC0+(\d)/, "SNFC$1");
}

export function isSeqCode(code: string): boolean {
  return SEQ_RE.test(code);
}

export function seqCode(n: number): string {
  return PREFIX + n;
}

export function publicBase(): string {
  return (process.env.PUBLIC_URL || "https://senanfc.com.br").replace(/\/+$/, "");
}

/** Caminho da placa no site (sem o domínio). */
export function platePath(code: string): string {
  return isSeqCode(code) ? `/${code}` : `/p/${code}`;
}

/** Link completo gravado na etiqueta. */
export function plateUrl(code: string): string {
  return publicBase() + platePath(code);
}
