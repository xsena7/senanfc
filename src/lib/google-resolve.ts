import { googleLinkKind } from "./google-link";

// Do link do Google Maps (o que vem do "Compartilhar") para o link que abre direto na avaliação, sem terceiros:
// 1) se o link já é de avaliação, usa; 2) segue o link curto (maps.app.goo.gl) só por domínios do Google;
// 3) se o endereço final tem o ID da loja (ChIJ...), monta o link oficial (writereview?placeid=);
// 4) se houver GOOGLE_PLACES_API_KEY (opcional), pergunta o ID ao Google (Text Search "IDs only", gratuita);
// 5) sem chave e sem ID no link: avisa (o link "#lrd=" da busca do Google só abre a página da loja no celular,
//    não a janela de avaliar — testado no iPhone).

export const reviewUrl = (placeId: string) => `https://search.google.com/local/writereview?placeid=${placeId}`;

const GOOGLE_HOST = /(^|\.)(google\.[a-z.]+|goo\.gl|g\.co|g\.page)$/i;

export function isGoogleHost(host: string): boolean {
  return GOOGLE_HOST.test(host);
}

export function toUrl(raw: string): URL | null {
  const s = raw.trim();
  if (!s) return null;
  try {
    return new URL(/^https?:\/\//i.test(s) ? s : "https://" + s);
  } catch {
    return null;
  }
}

/** ID da loja escrito no próprio link (place_id:, query_place_id=, !19s...). */
export function placeIdFromUrl(url: string): string | null {
  const d = safeDecode(url);
  const m = d.match(/(?:place_id[:=]|query_place_id=|!19s|placeid=)(ChIJ[0-9A-Za-z_-]{10,})/) ?? d.match(/\b(ChIJ[0-9A-Za-z_-]{20,})\b/);
  return m ? m[1] : null;
}

/** Código do lugar no Google Maps (0x...:0x...), presente em todo link de loja. */
export function featureIdFromUrl(url: string): string | null {
  const d = safeDecode(url);
  const m = d.match(/(?:!1s|ftid=)(0x[0-9a-f]+:0x[0-9a-f]+)/i);
  return m ? m[1].toLowerCase() : null;
}

/** Nome e coordenadas da loja num link longo do Google Maps. */
export function placeHintFromUrl(url: string): { name: string | null; lat: number | null; lng: number | null } {
  const d = safeDecode(url);
  const u = toUrl(d);
  let name: string | null = null;
  const m = d.match(/\/maps\/place\/([^/@?]+)/);
  if (m) name = m[1].replace(/\+/g, " ").trim();
  if (!name && u) name = u.searchParams.get("q") || u.searchParams.get("query");
  let lat: number | null = null;
  let lng: number | null = null;
  const pin = d.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/); // posição exata da loja
  const cam = d.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/); // posição da câmera
  const c = pin ?? cam;
  if (c) {
    lat = Number(c[1]);
    lng = Number(c[2]);
  }
  if (name && /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(name)) name = null; // "q" com coordenadas, não nome
  return { name, lat, lng };
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

type Fetch = typeof fetch;

/** Segue o link curto, mas só por domínios do Google (no máximo 6 saltos). */
export async function expandGoogleUrl(start: URL, f: Fetch = fetch): Promise<string> {
  let cur = start;
  for (let i = 0; i < 6; i++) {
    if (!isGoogleHost(cur.hostname)) throw new Error("Esse link não é do Google Maps.");
    const short = /(^|\.)(goo\.gl|g\.co)$/i.test(cur.hostname) || cur.hostname === "g.page";
    if (!short) return cur.toString();
    const r = await f(cur.toString(), { redirect: "manual", headers: { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" }, signal: AbortSignal.timeout(8000) });
    const loc = r.headers.get("location");
    if (!loc) return cur.toString();
    cur = new URL(loc, cur);
  }
  return cur.toString();
}

export async function findPlaceId(name: string, lat: number | null, lng: number | null, key: string, f: Fetch = fetch): Promise<string | null> {
  const body: Record<string, unknown> = { textQuery: name, pageSize: 1, languageCode: "pt-BR", regionCode: "BR" };
  if (lat != null && lng != null) body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 300 } };
  const r = await f("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "content-type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.id" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error("google_api_" + r.status);
  const j = (await r.json()) as { places?: { id: string }[] };
  return j.places?.[0]?.id ?? null;
}

export type ResolveResult = { url: string } | { error: string };

export async function resolveReviewLink(raw: string, key: string | undefined, f: Fetch = fetch): Promise<ResolveResult> {
  if (googleLinkKind(raw) === "review") return { url: toUrl(raw)!.toString() };
  const start = toUrl(raw);
  if (!start) return { error: "Link inválido. Cole o link do Google Maps da loja." };
  if (!isGoogleHost(start.hostname)) return { error: "Esse link não é do Google Maps." };
  // g.page/r/<id> sem o /review
  if (start.hostname === "g.page" && /^\/r\/[^/]+\/?$/.test(start.pathname)) return { url: `https://g.page${start.pathname.replace(/\/$/, "")}/review` };

  let final: string;
  try {
    final = await expandGoogleUrl(start, f);
  } catch (e) {
    return { error: e instanceof Error && e.message.includes("Google") ? e.message : "Não consegui abrir esse link. Confira e tente de novo." };
  }
  if (googleLinkKind(final) === "review") return { url: final };
  const id = placeIdFromUrl(final);
  if (id) return { url: reviewUrl(id) };

  const hint = placeHintFromUrl(final);
  if (key && hint.name) {
    try {
      const found = await findPlaceId(hint.name, hint.lat, hint.lng, key, f);
      if (found) return { url: reviewUrl(found) };
      return { error: "Não achei essa loja no Google. Confira o link ou use o gerador grátis abaixo." };
    } catch {
      return { error: "O Google não respondeu agora. Tente de novo ou use o gerador grátis abaixo." };
    }
  }
  if (!hint.name && !featureIdFromUrl(final)) return { error: "Esse link não é de uma loja. No Google Maps, abra a loja, toque em Compartilhar e copie o link." };
  return { error: "Para gerar sozinho falta configurar a chave do Google. Por enquanto, use o gerador grátis abaixo." };
}
