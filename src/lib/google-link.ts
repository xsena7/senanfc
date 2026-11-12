// Reconhece se o link do Google abre direto a tela de avaliar (sem dependências: roda no navegador)
export function googleLinkKind(raw: string): "" | "review" | "other" {
  const s = raw.trim();
  if (!s) return "";
  let u: URL;
  try {
    u = new URL(/^https?:\/\//i.test(s) ? s : "https://" + s);
  } catch {
    return "other";
  }
  const host = u.hostname.replace(/^www\./, "");
  // search.google.com/local/writereview?placeid=...  (o que o gerador devolve)
  if (host === "search.google.com" && u.pathname.startsWith("/local/writereview") && u.searchParams.get("placeid")) return "review";
  // g.page/r/<id>/review  (link do Perfil da Empresa)
  if (host === "g.page" && /^\/r\/[^/]+\/review\/?$/.test(u.pathname)) return "review";
  // Link curto de avaliação do Google
  if (host === "g.co" && u.pathname.startsWith("/kgs/")) return "review";
  // Busca do Google com #lrd=<código>,3 (abre "Escrever avaliação")
  if (/^google\.[a-z.]+$/.test(host) && u.pathname === "/search" && /lrd=0x[0-9a-f]+:0x[0-9a-f]+,3/i.test(u.hash)) return "review";
  return "other";
}
