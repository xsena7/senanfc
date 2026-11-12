// Gera as artes das plaquinhas (10x15 cm, 300 dpi) em PNG e PDF.
// Uso: node scripts/gerar-artes.cjs <pasta-de-saida>
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "../src/components/brand-paths.ts"), "utf8");
const P = Object.fromEntries([...src.matchAll(/export const (\w+)_PATH =\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));

const GOOGLE = `<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;
const glyph = (d, fill) => `<svg viewBox="0 0 24 24"><path fill="${fill}" d="${d}"/></svg>`;

// Ícone de cada marca num quadrado arredondado (como ícone de app)
const TILES = {
  PIX: { bg: "#ffffff", svg: glyph(P.PIX, "#32BCAD") },
  GOOGLE: { bg: "#ffffff", svg: GOOGLE },
  INSTAGRAM: { bg: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)", svg: glyph(P.INSTAGRAM, "#ffffff") },
  WHATSAPP: { bg: "#25D366", svg: glyph(P.WHATSAPP, "#ffffff") },
};
const tile = (k, size) => `<div class="tile" style="width:${size}mm;height:${size}mm;border-radius:${size * 0.24}mm;background:${TILES[k].bg}"><div style="width:62%;height:62%">${TILES[k].svg}</div></div>`;

const ARTS = [
  { file: "1-pix", top: tile("PIX", 22), title: "Pague com <b style='color:#5fe0d2'>Pix</b>", sub: "Copie o Pix em 1 segundo. Sem QR Code.", accent: "#32BCAD" },
  { file: "2-google", top: tile("GOOGLE", 22), stars: true, title: "Avalie a gente<br>no <b>Google</b>", sub: "Sua opinião faz toda a diferença!", accent: "#FBBC05" },
  { file: "3-instagram", top: tile("INSTAGRAM", 22), title: "Siga a gente<br>no <b>Instagram</b>", sub: "Novidades, promoções e bastidores.", accent: "#d6249f" },
  { file: "4-whatsapp", top: tile("WHATSAPP", 22), title: "Fale com a gente<br>no <b>WhatsApp</b>", sub: "Pedidos, dúvidas e atendimento.", accent: "#25D366" },
  { file: "5-kit-completo", top: "", kit: true, title: "Tudo num <b>toque</b>", sub: "Pague, avalie, siga e fale com a gente.", accent: "#22d3ee" },
];

const page = (a, B = 0) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=block" rel="stylesheet">
<style>
@page { size: ${100 + 2 * B}mm ${150 + 2 * B}mm; margin: 0 }
* { box-sizing: border-box; margin: 0 }
html, body { width: ${100 + 2 * B}mm; height: ${150 + 2 * B}mm }
.cut { position: absolute; left: ${B}mm; top: ${B}mm; width: 100mm; height: 150mm }
body { font-family: Inter, -apple-system, system-ui, sans-serif; color: #fff; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  background:
    radial-gradient(70mm 45mm at 50% calc(${B}mm - 7.5mm), rgba(59,110,246,.55), transparent 70%),
    radial-gradient(55mm 40mm at 50% 105%, ${a.accent}40, transparent 70%),
    linear-gradient(rgba(255,255,255,.045) .25mm, transparent .25mm) 0 0/6mm 6mm,
    linear-gradient(90deg, rgba(255,255,255,.045) .25mm, transparent .25mm) 0 0/6mm 6mm,
    #05070d; }
.wrap { position: absolute; inset: 7mm; display: flex; flex-direction: column; align-items: center; text-align: center }
.tile { display: flex; align-items: center; justify-content: center; box-shadow: 0 2mm 6mm rgba(0,0,0,.5), 0 0 0 .4mm rgba(255,255,255,.15) }
.tile svg { width: 100%; height: 100%; display: block }
h1 { margin-top: 5mm; font-size: 10.5mm; line-height: 1.05; font-weight: 800; letter-spacing: -.3mm }
h1 b { font-weight: 900 }
.stars { margin-top: 3mm; font-size: 7mm; letter-spacing: 1mm; color: #FBBC05; text-shadow: 0 0 4mm rgba(251,188,5,.5) }
/* Círculo SEMPRE no mesmo lugar (centro a 50 mm da esquerda e 88 mm do topo): é onde o chip fica colado atrás */
.zone { position: absolute; left: 0; right: 0; top: 67mm; display: flex; flex-direction: column; align-items: center; text-align: center }
.target { position: relative; width: 42mm; height: 42mm; display: flex; align-items: center; justify-content: center }
.ring { position: absolute; border-radius: 50%; border: .5mm solid rgba(34,211,238,.45) }
.core { width: 30mm; height: 30mm; border-radius: 50%; background: linear-gradient(135deg, #3b6ef6, #22d3ee); display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 10mm rgba(34,211,238,.65), inset 0 .6mm 0 rgba(255,255,255,.35) }
.core svg { width: 15mm; height: 15mm }
.cta { margin-top: 5mm; font-size: 6.2mm; font-weight: 800 }
.cta span { color: ${a.accent} }
.sub { margin-top: 1.8mm; font-size: 3.7mm; color: rgba(255,255,255,.7); font-weight: 500 }
.kit { margin-top: 5mm; display: flex; gap: 4mm }
.kit div { display: flex; flex-direction: column; align-items: center; gap: 1.4mm; font-size: 2.9mm; font-weight: 700; color: rgba(255,255,255,.85) }
.foot { display: flex; align-items: center; gap: 1.5mm; font-size: 3mm; font-weight: 700; color: rgba(255,255,255,.45) }
.foot i { font-style: normal; color: rgba(103,232,249,.7) }
.foot svg { width: 4.2mm; height: 4.2mm }
.spacer { margin-top: auto }
</style></head><body><div class="cut"><div class="wrap">
  ${a.kit ? "" : a.top}
  ${a.stars ? '<div class="stars">★★★★★</div>' : ""}
  <h1 style="${a.kit ? "margin-top:2mm" : ""}">${a.title}</h1>
  ${a.kit ? `<div class="kit">${[["PIX", "Pix"], ["GOOGLE", "Avaliar"], ["INSTAGRAM", "Instagram"], ["WHATSAPP", "WhatsApp"]].map(([k, n]) => `<div>${tile(k, 15)}${n}</div>`).join("")}</div>` : ""}
</div>
<div class="zone">
  <div class="target">
    <div class="ring" style="inset:-2mm"></div>
    <div class="ring" style="inset:-7mm;opacity:.55"></div>
    <div class="ring" style="inset:-12mm;opacity:.25"></div>
    <div class="core"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"><path d="M8.5 8a5 5 0 0 1 0 8"/><path d="M12 5.5a9 9 0 0 1 0 13"/><path d="M15.5 3a13 13 0 0 1 0 18"/></svg></div>
  </div>
  <p class="cta">Aproxime o celular <span>aqui</span></p>
  <p class="sub">${a.sub}</p>
</div>
<div class="wrap" style="justify-content:flex-end">
  <div class="foot"><svg viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b6ef6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#g)"/><g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M24 23a13 13 0 0 1 0 18"/><path d="M32 17a21 21 0 0 1 0 30"/><path d="M40 11a29 29 0 0 1 0 42" opacity=".7"/></g><circle cx="16" cy="32" r="4" fill="#fff"/></svg>Sena<i>NFC</i></div>
</div></div></body></html>`;

// Uso: node scripts/gerar-artes.cjs <pasta> [sangria_mm]   (ex.: 3 → arquivo 106x156 mm que corta em 100x150)
(async () => {
  const out = process.argv[2] || "artes";
  const B = Number(process.argv[3] || 0);
  const suf = B ? `-sangria-${B}mm` : "";
  fs.mkdirSync(out, { recursive: true });
  const br = await chromium.launch();
  const mm = 96 / 25.4; // px CSS por mm
  const W = (100 + 2 * B) * mm, H = (150 + 2 * B) * mm;
  // escala 3.125 → 300 dpi (sem sangria: 1181 x 1772 px)
  const pg = await br.newPage({ viewport: { width: Math.ceil(W), height: Math.ceil(H) }, deviceScaleFactor: 3.125 });
  for (const a of ARTS) {
    await pg.setContent(page(a, B), { waitUntil: "networkidle" });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(out, a.file + suf + ".png"), clip: { x: 0, y: 0, width: Math.round(W), height: Math.round(H) } });
    await pg.pdf({ path: path.join(out, a.file + suf + ".pdf"), width: `${100 + 2 * B}mm`, height: `${150 + 2 * B}mm`, printBackground: true });
  }
  await br.close();
  console.log("ok", out);
})();
