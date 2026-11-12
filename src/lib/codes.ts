import { randomInt } from "node:crypto";

// Sem letras/números que confundem (0/O, 1/I/L)
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function newCode(len = 6): string {
  let s = "";
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function publicBase(): string {
  return (process.env.PUBLIC_URL || "https://senanfc.com.br").replace(/\/+$/, "");
}

export function plateUrl(code: string): string {
  return `${publicBase()}/p/${code}`;
}
