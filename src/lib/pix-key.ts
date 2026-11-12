// Sem dependências: usado no navegador também
export type PixKeyTypeT = "CPF" | "CNPJ" | "PHONE" | "EMAIL" | "RANDOM";

export const PIX_KEY_LABEL: Record<PixKeyTypeT, string> = {
  CPF: "CPF",
  CNPJ: "CNPJ",
  PHONE: "Celular",
  EMAIL: "E-mail",
  RANDOM: "Chave aleatória",
};

/** Deixa a chave no formato que o Banco Central espera. Celular volta sem o "+" (55DDD...). */
export function normalizePixKey(raw: string, type: PixKeyTypeT): string | null {
  const s = raw.trim();
  const d = s.replace(/\D/g, "");
  switch (type) {
    case "CPF":
      return d.length === 11 ? d : null;
    case "CNPJ":
      return d.length === 14 ? d : null;
    case "PHONE": {
      const n = d.length === 10 || d.length === 11 ? "55" + d : d;
      return n.length === 12 || n.length === 13 ? n : null;
    }
    case "EMAIL":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s.toLowerCase() : null;
    case "RANDOM":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s) ? s.toLowerCase() : null;
  }
}

/** Mostra a chave bonitinha para quem vai pagar. */
export function displayPixKey(key: string, type: PixKeyTypeT): string {
  if (type === "CPF") return key.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (type === "CNPJ") return key.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (type === "PHONE") {
    const n = key.startsWith("55") ? key.slice(2) : key;
    return n.length === 11 ? n.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3") : n.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return key;
}
