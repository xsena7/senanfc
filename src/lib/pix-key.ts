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

function cpfValid(d: string): boolean {
  if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

/**
 * Descobre o tipo da chave pelo que foi digitado.
 * Quando 11 números podem ser CPF ou celular, devolve as duas opções para o vendedor escolher.
 */
export function detectPixKeyType(raw: string): { type: PixKeyTypeT | null; options?: PixKeyTypeT[] } {
  const s = raw.trim();
  if (!s) return { type: null };
  if (s.includes("@")) return { type: "EMAIL" };
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) return { type: "RANDOM" };
  const d = s.replace(/\D/g, "");
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(s)) return { type: "CPF" };
  if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(s) || d.length === 14) return { type: "CNPJ" };
  if (/^\+|\(/.test(s) || ((d.length === 12 || d.length === 13) && d.startsWith("55"))) return { type: "PHONE" };
  if (d.length === 10) return { type: "PHONE" };
  if (d.length === 11) {
    const mobile = d[2] === "9";
    if (cpfValid(d)) return mobile ? { type: "CPF", options: ["CPF", "PHONE"] } : { type: "CPF" };
    return mobile ? { type: "PHONE" } : { type: null };
  }
  return { type: null };
}
