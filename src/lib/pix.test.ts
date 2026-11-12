import { test } from "node:test";
import assert from "node:assert/strict";
import { crc16, pixCopiaECola, normalizePixKey } from "./pix.ts";
import { normalizeWhatsapp, normalizeInstagram, normalizeUrl } from "./links.ts";

test("crc16 CCITT-FALSE", () => {
  assert.equal(crc16("123456789"), "29B1");
});

test("pix copia e cola tem CRC certo", () => {
  const p = pixCopiaECola({ key: "12345678909", type: "CPF", name: "Padaria do Zé", city: "Goiânia" });
  assert.ok(p.startsWith("000201"));
  assert.ok(p.includes("br.gov.bcb.pix0111" + "12345678909"));
  assert.ok(p.includes("5913PADARIA DO ZE"));
  assert.ok(p.includes("6007GOIANIA"));
  assert.equal(p.slice(-4), crc16(p.slice(0, -4)));
});

test("celular ganha +55", () => {
  const p = pixCopiaECola({ key: normalizePixKey("(62) 99999-8888", "PHONE")!, type: "PHONE", name: "Ze", city: "Goiania" });
  assert.ok(p.includes("0114+5562999998888"));
});

test("normalizações", () => {
  assert.equal(normalizeWhatsapp("(62) 99999-8888"), "5562999998888");
  assert.equal(normalizeWhatsapp("123"), null);
  assert.equal(normalizeInstagram("@Padaria.Ze"), "padaria.ze");
  assert.equal(normalizeInstagram("https://www.instagram.com/padaria_ze/?hl=pt"), "padaria_ze");
  assert.equal(normalizeUrl("g.page/r/abc/review"), "https://g.page/r/abc/review");
  assert.equal(normalizePixKey("123.456.789-09", "CPF"), "12345678909");
  assert.equal(normalizePixKey("x", "EMAIL"), null);
});

import { googleLinkKind } from "./google-link.ts";
test("link do Google", () => {
  assert.equal(googleLinkKind("https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"), "review");
  assert.equal(googleLinkKind("g.page/r/CabcDEF123/review"), "review");
  assert.equal(googleLinkKind("https://g.co/kgs/abc123"), "review");
  assert.equal(googleLinkKind("https://maps.app.goo.gl/xyz"), "other");
  assert.equal(googleLinkKind(""), "");
});
test("link lrd conta como avaliação", () => {
  assert.equal(googleLinkKind("https://www.google.com/search?q=x&ludocid=1#lrd=0x935ef1b2:0x5a1b2c3d,3,,,,"), "review");
});
