import { normalizeInstagram, normalizeUrl, normalizeWhatsapp } from "./links";
import { normalizePixKey, type PixKeyTypeT } from "./pix-key";
import type { PlateKindT } from "./catalog";

export type ClientData = {
  name: string;
  whatsapp: string | null;
  instagram: string | null;
  pixKey: string | null;
  pixKeyType: PixKeyTypeT | null;
  pixName: string | null;
  pixCity: string | null;
  googleUrl: string | null;
  notes: string | null;
};

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const PIX_TYPES = ["CPF", "CNPJ", "PHONE", "EMAIL", "RANDOM"];

/** Lê os campos do cliente e devolve o primeiro problema em português simples. */
export function parseClient(f: FormData): { data?: ClientData; error?: string } {
  const name = str(f, "name");
  if (!name) return { error: "Coloque o nome da loja." };

  const rawZap = str(f, "whatsapp");
  const whatsapp = normalizeWhatsapp(rawZap);
  if (rawZap && !whatsapp) return { error: "WhatsApp inválido. Coloque com DDD, ex.: (62) 99999-8888." };

  const rawInsta = str(f, "instagram");
  const instagram = normalizeInstagram(rawInsta);
  if (rawInsta && !instagram) return { error: "Instagram inválido. Coloque só o @ da loja." };

  const rawGoogle = str(f, "googleUrl");
  const googleUrl = normalizeUrl(rawGoogle);
  if (rawGoogle && !googleUrl) return { error: "Link do Google inválido. Cole o link de avaliação completo." };

  const rawPix = str(f, "pixKey");
  const typeRaw = str(f, "pixKeyType");
  let pixKey: string | null = null;
  let pixKeyType: PixKeyTypeT | null = null;
  if (rawPix) {
    if (!PIX_TYPES.includes(typeRaw)) return { error: "Escolha o tipo da chave Pix." };
    pixKeyType = typeRaw as PixKeyTypeT;
    pixKey = normalizePixKey(rawPix, pixKeyType);
    if (!pixKey) return { error: "Chave Pix não confere com o tipo escolhido. Confira os números." };
  }

  return {
    data: {
      name,
      whatsapp,
      instagram,
      pixKey,
      pixKeyType,
      pixName: str(f, "pixName") || null,
      pixCity: str(f, "pixCity") || null,
      googleUrl,
      notes: str(f, "notes") || null,
    },
  };
}

/** Confere se o cliente tem o que a placa precisa. */
export function missingForKind(c: Pick<ClientData, "whatsapp" | "instagram" | "pixKey" | "googleUrl">, kind: PlateKindT): string | null {
  if (kind === "PIX" && !c.pixKey) return "Para placa de Pix, coloque a chave Pix do cliente.";
  if (kind === "GOOGLE" && !c.googleUrl) return "Para placa do Google, cole o link de avaliação do cliente.";
  if (kind === "INSTAGRAM" && !c.instagram) return "Para placa do Instagram, coloque o @ do cliente.";
  if (kind === "WHATSAPP" && !c.whatsapp) return "Para placa do WhatsApp, coloque o número do cliente.";
  if (kind === "KIT" && !c.pixKey && !c.googleUrl && !c.instagram && !c.whatsapp)
    return "Para o kit, coloque pelo menos um link (Pix, Google, Instagram ou WhatsApp).";
  return null;
}
