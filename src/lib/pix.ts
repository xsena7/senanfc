// "Pix copia e cola" (BR Code estático, sem valor), padrão do Banco Central
import type { PixKeyTypeT } from "./pix-key";
export { normalizePixKey, PIX_KEY_LABEL } from "./pix-key";
export type { PixKeyTypeT } from "./pix-key";

function field(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

export function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function clean(s: string, max: number): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, max);
}

export function pixCopiaECola(opts: { key: string; type: PixKeyTypeT; name: string; city: string }): string {
  const key = opts.type === "PHONE" ? "+" + opts.key : opts.key;
  const account = field("00", "br.gov.bcb.pix") + field("01", key);
  const body =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    field("58", "BR") +
    field("59", clean(opts.name, 25) || "RECEBEDOR") +
    field("60", clean(opts.city, 15) || "GOIANIA") +
    field("62", field("05", "***")) +
    "6304";
  return body + crc16(body);
}
