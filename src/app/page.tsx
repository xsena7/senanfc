import Link from "next/link";
import { ArrowRight, BadgeCheck, ChartNoAxesColumn, Hand, RefreshCw, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand";
import { KindIcon, WhatsappGlyph } from "@/components/icons";
import { brl } from "@/lib/format";
import { PRODUCT_PRICE } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sena NFC · Placas por aproximação em Goiânia",
  description: "Placas de mesa com NFC: o cliente encosta o celular e abre seu Pix, avaliação no Google, Instagram ou WhatsApp. Sem QR Code, sem app.",
};

const PLATES = [
  { k: "PIX" as const, title: "Placa Pix", text: "Encostou, copiou o Pix. Sem digitar chave, sem erro." },
  { k: "GOOGLE" as const, title: "Placa Avaliação Google", text: "Abre direto a tela das 5 estrelas. Mais avaliações, mais clientes." },
  { k: "INSTAGRAM" as const, title: "Placa Instagram", text: "Abre o seu perfil na hora. Cliente vira seguidor em 1 segundo." },
  { k: "WHATSAPP" as const, title: "Placa WhatsApp", text: "Abre a conversa com a sua loja, pronta para pedir." },
];

const STEPS = [
  { icon: Hand, title: "Aproxima", text: "O cliente encosta o celular na placa." },
  { icon: Zap, title: "Abre na hora", text: "Sem app, sem câmera, sem QR Code." },
  { icon: BadgeCheck, title: "Pronto", text: "Pagou, avaliou, seguiu ou chamou." },
];

const PERKS = [
  { icon: RefreshCw, title: "Atualiza sem trocar a placa", text: "Mudou o Pix, o @ ou o número? A gente atualiza em segundos. A placa continua a mesma." },
  { icon: ChartNoAxesColumn, title: "Você sabe quantos usaram", text: "Cada toque na placa é contado. Dá para ver o resultado de verdade." },
  { icon: Smartphone, title: "Funciona nos celulares atuais", text: "iPhone e Android com NFC. No iPhone é só encostar, sem abrir nada." },
  { icon: ShieldCheck, title: "Segura e travada", text: "A etiqueta sai travada de fábrica: ninguém consegue trocar o seu link." },
];

const FAQ = [
  ["Precisa baixar aplicativo?", "Não. O celular do cliente lê sozinho, é só encostar."],
  ["Funciona em qualquer celular?", "Funciona nos celulares com NFC, que são quase todos os atuais. iPhone XS ou mais novo lê direto; no Android o NFC precisa estar ligado."],
  ["E se eu mudar meu Pix ou meu Instagram?", "Sem problema: a gente atualiza o destino e a mesma placa passa a abrir o novo. Você não compra outra."],
  ["Alguém pode mexer na minha placa?", "Não. A etiqueta é travada depois de gravada, ninguém consegue regravar."],
  ["Precisa de internet ou bateria na placa?", "A placa não usa bateria nem tomada. Quem usa internet é o celular do cliente, como em qualquer site."],
];

function Phone() {
  return (
    <div className="tap-phone absolute -bottom-10 -right-6 w-[118px] sm:-right-16 sm:w-[140px]">
      <div className="rounded-[2rem] border border-white/20 bg-[#0b0f1a] p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,.8)]">
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/20" />
        <div className="space-y-2 rounded-[1.4rem] bg-gradient-to-b from-[#0f1730] to-[#070a12] p-3">
          <div className="mx-auto h-9 w-9 rounded-full bg-gradient-to-br from-brand-500 to-cyan-400" />
          <div className="mx-auto h-2 w-16 rounded bg-white/70" />
          {(["GOOGLE", "INSTAGRAM", "WHATSAPP", "PIX"] as const).map((k) => (
            <div key={k} className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5">
              <KindIcon kind={k} size="sm" />
              <div className="h-1.5 flex-1 rounded bg-white/25" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Plate() {
  return (
    <div className="relative mx-auto mb-8 h-[300px] w-[240px] sm:h-[340px] sm:w-[270px]">
      <div className="float-y absolute inset-0">
        {/* acrílico */}
        <div className="absolute inset-0 rounded-[28px] border border-white/25 bg-gradient-to-br from-white/20 via-white/[0.06] to-white/[0.02] shadow-[0_40px_80px_-20px_rgba(59,110,246,.45)] backdrop-blur-md" />
        <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-[20px] bg-gradient-to-b from-[#0d1428] to-[#060912] p-5 text-center">
          <LogoMark className="h-8 w-8 opacity-90" />
          <p className="mt-3 text-xs font-semibold uppercase tracking-[.25em] text-cyan-300/80">Aproxime o celular</p>
          <div className="relative my-6 flex h-20 w-20 items-center justify-center">
            <span className="nfc-ring absolute inset-0 rounded-full border-2 border-cyan-300/60" />
            <span className="nfc-ring absolute inset-0 rounded-full border-2 border-cyan-300/60 [animation-delay:.8s]" />
            <span className="nfc-ring absolute inset-0 rounded-full border-2 border-cyan-300/60 [animation-delay:1.6s]" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 text-white shadow-[0_0_40px_rgba(34,211,238,.6)]">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8.5 8a5 5 0 0 1 0 8" /><path d="M12 5.5a9 9 0 0 1 0 13" /><path d="M15.5 3a13 13 0 0 1 0 18" /></svg>
            </span>
          </div>
          <p className="text-lg font-bold text-white">Sua Loja</p>
          <p className="text-xs text-white/50">é só encostar</p>
        </div>
        {/* base em L */}
        <div className="absolute -bottom-3 left-4 right-4 h-4 rounded-b-xl border border-white/20 bg-white/10" />
      </div>
      <Phone />
    </div>
  );
}

export default function Home() {
  const zap = process.env.CONTACT_WHATSAPP?.replace(/\D/g, "");
  const cta = zap ? `https://wa.me/${zap}?text=${encodeURIComponent("Oi! Quero saber das placas NFC")}` : "/demo";

  return (
    <main className="tech min-h-dvh overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo className="text-lg text-white" dark />
        <nav className="flex items-center gap-5 text-sm text-white/70">
          <a href="#placas" className="hidden hover:text-white sm:block">Placas</a>
          <a href="#precos" className="hidden hover:text-white sm:block">Preços</a>
          <Link href="/login" className="rounded-full border border-white/15 px-4 py-1.5 font-semibold text-white hover:bg-white/10">Entrar</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-8 md:grid-cols-2 md:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            <Sparkles className="h-3.5 w-3.5" /> Tecnologia NFC · Goiânia
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Encostou, <span className="text-glow">abriu.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/65">
            Placas de mesa por aproximação. Seu cliente encosta o celular e já cai no seu <b className="text-white">Pix</b>, na sua <b className="text-white">avaliação do Google</b>, no
            seu <b className="text-white">Instagram</b> ou no seu <b className="text-white">WhatsApp</b>.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={cta} className="btn bg-gradient-to-r from-brand-500 to-cyan-400 px-6 text-white shadow-[0_15px_40px_-10px_rgba(59,110,246,.8)]">
              {zap ? <WhatsappGlyph className="h-5 w-5" /> : null} Quero minha placa <ArrowRight className="h-4 w-4" />
            </a>
            <Link href="/demo" className="btn border border-white/15 bg-white/5 px-6 text-white hover:bg-white/10">Ver demonstração</Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-white/50">
            <div className="flex gap-1">
              {(["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP"] as const).map((k) => (
                <KindIcon key={k} kind={k} size="sm" />
              ))}
            </div>
            Sem QR Code. Sem app. Sem complicação.
          </div>
        </div>
        <Plate />
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="glass p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/30 to-cyan-400/20 text-cyan-200"><s.icon className="h-5 w-5" /></span>
                <span className="font-mono text-sm text-white/30">0{i + 1}</span>
              </div>
              <p className="mt-4 text-lg font-bold text-white">{s.title}</p>
              <p className="text-white/55">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PLACAS */}
      <section id="placas" className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Uma placa para cada objetivo</h2>
        <p className="mt-2 text-white/55">Acrílico transparente, de mesa ou balcão, com a etiqueta NFC já gravada.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATES.map((p) => (
            <div key={p.k} className="glass group p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]">
              <KindIcon kind={p.k} size="lg" />
              <p className="mt-5 text-lg font-bold text-white">{p.title}</p>
              <p className="mt-1 text-sm text-white/55">{p.text}</p>
              <p className="mt-5 text-2xl font-extrabold text-white">{brl(PRODUCT_PRICE.SINGLE)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇOS */}
      <section id="precos" className="mx-auto max-w-6xl px-5 pb-20">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Leve mais, pague menos</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="glass p-7">
            <p className="text-sm font-semibold text-white/50">Avulsa</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{brl(PRODUCT_PRICE.SINGLE)}</p>
            <p className="mt-2 text-white/55">1 placa à sua escolha: Pix, Google, Instagram ou WhatsApp.</p>
          </div>
          <div className="glass p-7">
            <p className="text-sm font-semibold text-white/50">Dupla</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{brl(PRODUCT_PRICE.DUO)}</p>
            <p className="mt-2 text-white/55">2 placas quaisquer. Ex.: Pix no caixa e Google nas mesas.</p>
            <p className="mt-3 inline-block rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">Economize {brl(PRODUCT_PRICE.SINGLE * 2 - PRODUCT_PRICE.DUO)}</p>
          </div>
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-500 to-cyan-400 p-[1.5px] shadow-[0_30px_80px_-20px_rgba(34,211,238,.5)]">
            <div className="h-full rounded-[calc(1.5rem-1.5px)] bg-[#0a0f1d] p-7">
              <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 px-3 py-1 text-xs font-bold text-white">MAIS COMPLETO</span>
              <p className="text-sm font-semibold text-cyan-200">Kit 4 links</p>
              <p className="mt-2 text-4xl font-extrabold text-white">{brl(PRODUCT_PRICE.KIT)}</p>
              <p className="mt-2 text-white/60">1 placa que abre a página da sua loja com <b className="text-white">Pix, Google, Instagram e WhatsApp</b> juntos.</p>
              <div className="mt-4 flex gap-2">
                {(["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP"] as const).map((k) => <KindIcon key={k} kind={k} size="sm" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VANTAGENS */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div key={p.title} className="glass flex gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-cyan-200"><p.icon className="h-5 w-5" /></span>
              <div>
                <p className="font-bold text-white">{p.title}</p>
                <p className="text-sm text-white/55">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-white">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="glass group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white">
                {q}
                <span className="ml-4 text-white/40 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-white/60">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="glass relative overflow-hidden p-10 text-center">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_120%,rgba(34,211,238,.25),transparent)]" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Seu comércio no futuro, num toque.</h2>
          <p className="relative mt-3 text-white/60">Atendemos Goiânia e região. A gente leva, instala e testa na hora.</p>
          <a href={cta} className="btn relative mt-7 bg-white px-7 text-slate-900 hover:bg-white/90">
            Quero minha placa <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-sm text-white/40">
        <Logo className="text-sm text-white/70" dark />
        <p className="mt-2">© {new Date().getFullYear()} Sena NFC · Goiânia - GO</p>
      </footer>
    </main>
  );
}
