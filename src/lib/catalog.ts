// Tudo que é texto/preço de produto fica aqui (sem dependências: roda no navegador também)
export type PlateKindT = "PIX" | "GOOGLE" | "INSTAGRAM" | "WHATSAPP" | "KIT";
export type ProductT = "SINGLE" | "DUO" | "KIT";
export type PaymentT = "PIX" | "DINHEIRO" | "CARTAO" | "PENDENTE";

export const KIND_LABEL: Record<PlateKindT, string> = {
  PIX: "Pix",
  GOOGLE: "Avaliação Google",
  INSTAGRAM: "Instagram",
  WHATSAPP: "WhatsApp",
  KIT: "Kit 4 links",
};

export const PRODUCT_LABEL: Record<ProductT, string> = {
  SINGLE: "1 placa",
  DUO: "2 placas",
  KIT: "Kit 4 links",
};

export const PRODUCT_PRICE: Record<ProductT, number> = {
  SINGLE: 6990,
  DUO: 10000,
  KIT: 13990,
};

export const PRODUCT_PLATES: Record<ProductT, number> = { SINGLE: 1, DUO: 2, KIT: 1 };

export const PAYMENT_LABEL: Record<PaymentT, string> = {
  PIX: "Pix",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  PENDENTE: "Fica devendo",
};
