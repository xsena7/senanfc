// Nomes dos tipos de placa e preços mostrados no site (sem dependências: roda no navegador também)
export type PlateKindT = "PIX" | "GOOGLE" | "INSTAGRAM" | "WHATSAPP" | "KIT";
export type ProductT = "SINGLE" | "DUO" | "KIT";

export const KIND_LABEL: Record<PlateKindT, string> = {
  PIX: "Pix",
  GOOGLE: "Avaliação Google",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  KIT: "Kit completo",
};


export const PRODUCT_PRICE: Record<ProductT, number> = {
  SINGLE: 6990,
  DUO: 10000,
  KIT: 13990,
};


