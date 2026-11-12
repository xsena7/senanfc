// Monta os links de destino a partir do que o vendedor digitou (aceita do jeito que vier)

export function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/** WhatsApp: aceita (62) 99999-9999, 62999999999, +55 62..., wa.me/... */
export function normalizeWhatsapp(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = onlyDigits(raw);
  if (!d) return null;
  if (d.length === 10 || d.length === 11) d = "55" + d;
  if (d.length < 12 || d.length > 13) return null;
  return d;
}

export function whatsappUrl(num: string): string {
  return `https://wa.me/${num}`;
}

/** Instagram: aceita @loja, loja, instagram.com/loja/ */
export function normalizeInstagram(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  const m = s.match(/instagram\.com\/([^/?#\s]+)/i);
  if (m) s = m[1];
  s = s.replace(/^@+/, "").trim().toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(s)) return null;
  return s;
}

export function instagramUrl(user: string): string {
  return `https://instagram.com/${user}`;
}

/** Link do Google: precisa ser um link de verdade (g.page, maps, search.google...). */
export function normalizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw.trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}
