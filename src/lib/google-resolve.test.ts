import { test } from "node:test";
import assert from "node:assert/strict";
import { placeHintFromUrl, placeIdFromUrl, resolveReviewLink } from "./google-resolve.ts";

const LONG =
  "https://www.google.com/maps/place/Barbearia+do+L%C3%A9o/@-16.6869,-49.2648,17z/data=!3m1!4b1!4m6!3m5!1s0x935ef1b2:0x5a1b2c3d!8m2!3d-16.6871!4d-49.2643!16s%2Fg%2F11c5?entry=ttu";

test("lê nome e posição do link longo", () => {
  assert.deepEqual(placeHintFromUrl(LONG), { name: "Barbearia do Léo", lat: -16.6871, lng: -49.2643 });
  assert.equal(placeIdFromUrl(LONG), null);
  assert.equal(placeIdFromUrl("https://www.google.com/maps/search/?api=1&query=x&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4"), "ChIJN1t_tDeuEmsRUsoyG83frY4");
  assert.equal(placeIdFromUrl(LONG.replace("!16s", "!19sChIJN1t_tDeuEmsRUsoyG83frY4!16s")), "ChIJN1t_tDeuEmsRUsoyG83frY4");
});

function fakeFetch(map: Record<string, { status: number; location?: string; json?: unknown }>) {
  const calls: { url: string; body?: string }[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    calls.push({ url, body: init?.body as string | undefined });
    const r = map[url] ?? { status: 404 };
    return new Response(r.json ? JSON.stringify(r.json) : null, { status: r.status, headers: r.location ? { location: r.location } : {} });
  }) as unknown as typeof fetch;
  return { f, calls };
}

test("link curto → segue → pergunta o ID ao Google → link de avaliação", async () => {
  const { f, calls } = fakeFetch({
    "https://maps.app.goo.gl/abc123": { status: 302, location: LONG },
    "https://places.googleapis.com/v1/places:searchText": { status: 200, json: { places: [{ id: "ChIJabcdefghij1234567890" }] } },
  });
  const r = await resolveReviewLink("https://maps.app.goo.gl/abc123", "KEY", f);
  assert.deepEqual(r, { url: "https://search.google.com/local/writereview?placeid=ChIJabcdefghij1234567890" });
  const body = JSON.parse(calls[1].body!);
  assert.equal(body.textQuery, "Barbearia do Léo");
  assert.equal(body.locationBias.circle.center.latitude, -16.6871);
});

test("sem chave: monta o link de avaliação com o código do lugar", async () => {
  const { f, calls } = fakeFetch({ "https://maps.app.goo.gl/abc123": { status: 302, location: LONG } });
  const r = await resolveReviewLink("maps.app.goo.gl/abc123", undefined, f);
  assert.ok("url" in r);
  const u = new URL((r as { url: string }).url);
  assert.equal(u.hostname, "www.google.com");
  assert.equal(u.searchParams.get("q"), "Barbearia do Léo");
  assert.equal(u.searchParams.get("ludocid"), BigInt("0x5a1b2c3d").toString());
  assert.equal(u.hash, "#lrd=0x935ef1b2:0x5a1b2c3d,3,,,,");
  assert.equal(calls.length, 1); // só o próprio Google (link curto)
});

test("link que não é de loja", async () => {
  const { f } = fakeFetch({});
  const r = await resolveReviewLink("https://www.google.com/maps/@-16.68,-49.26,15z", undefined, f);
  assert.ok("error" in r);
});

test("não segue para fora do Google", async () => {
  const { f } = fakeFetch({ "https://maps.app.goo.gl/x": { status: 302, location: "https://site-malicioso.com/" } });
  const r = await resolveReviewLink("https://maps.app.goo.gl/x", "KEY", f);
  assert.deepEqual(r, { error: "Esse link não é do Google Maps." });
  assert.deepEqual(await resolveReviewLink("https://exemplo.com", "KEY", f), { error: "Esse link não é do Google Maps." });
});

test("já é link de avaliação", async () => {
  const { f, calls } = fakeFetch({});
  assert.deepEqual(await resolveReviewLink("g.page/r/CabcDEF/review", undefined, f), { url: "https://g.page/r/CabcDEF/review" });
  assert.deepEqual(await resolveReviewLink("https://g.page/r/CabcDEF", undefined, f), { url: "https://g.page/r/CabcDEF/review" });
  assert.equal(calls.length, 0);
});
