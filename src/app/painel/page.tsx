import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, ArrowRight, Hand, Store, Tags } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { normalizeCode, platePath } from "@/lib/codes";
import { dateTime, startOfDayBR } from "@/lib/format";
import { KIND_LABEL } from "@/lib/catalog";
import { KindIcon } from "@/components/icons";
import { InstallCard } from "@/components/pwa";

export const dynamic = "force-dynamic";

async function goToPlate(f: FormData) {
  "use server";
  const code = normalizeCode(String(f.get("code") ?? ""));
  if (code) redirect(platePath(code));
}

export default async function PainelHome() {
  const user = await requireUser();
  const today = startOfDayBR();
  const [active, blank, clients, tapsToday, todayActivated, last] = await Promise.all([
    db.plate.count({ where: { status: "ACTIVE" } }),
    db.plate.count({ where: { status: "BLANK" } }),
    db.client.count(),
    db.tap.count({ where: { createdAt: { gte: today } } }),
    db.plate.count({ where: { activatedAt: { gte: today } } }),
    db.plate.findMany({ where: { status: { not: "BLANK" } }, orderBy: { activatedAt: "desc" }, take: 6, include: { client: true, activatedBy: true } }),
  ]);
  const hour = Number(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo", hour: "numeric", hour12: false }));
  const hello = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-white/50">{hello},</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">{user.name.split(" ")[0]}</h1>
      </div>

      <InstallCard />

      {/* Ativar */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600 via-brand-500 to-cyan-400 p-5 shadow-[0_25px_60px_-20px_rgba(37,84,232,.9)]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40">
          <span className="nfc-ring absolute inset-0 rounded-full border-2 border-white/40" />
          <span className="nfc-ring absolute inset-0 rounded-full border-2 border-white/40 [animation-delay:.8s]" />
          <span className="nfc-ring absolute inset-0 rounded-full border-2 border-white/40 [animation-delay:1.6s]" />
        </div>
        <p className="relative flex items-center gap-2 text-lg font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20"><Hand className="h-5 w-5" /></span>
          Ativar placa
        </p>
        <p className="relative mt-2 text-sm text-white/85">Encoste o iPhone na placa nova. Abre a tela: estabelecimento, do que é a placa, links e pronto.</p>
        <form action={goToPlate} className="relative mt-4 flex gap-2">
          <input name="code" className="w-full rounded-xl border border-white/30 bg-white/15 px-3 py-3 text-white outline-none placeholder:text-white/60 focus:bg-white/25" placeholder="Ou digite o número (ex.: 8)" inputMode="numeric" />
          <button className="btn shrink-0 text-[#1d43c4] hover:opacity-90" style={{ backgroundColor: "#fff" }}>Abrir <ArrowRight className="h-4 w-4" /></button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Tags className="h-4 w-4" />} label="Placas ativas" value={active} sub={`+${todayActivated} hoje`} accent="from-emerald-400 to-teal-300" />
        <Stat icon={<Tags className="h-4 w-4" />} label="Placas novas" value={blank} sub="prontas para ativar" accent="from-brand-500 to-cyan-400" />
        <Stat icon={<Store className="h-4 w-4" />} label="Estabelecimentos" value={clients} sub="cadastrados" accent="from-violet-400 to-fuchsia-400" />
        <Stat icon={<Activity className="h-4 w-4" />} label="Toques hoje" value={tapsToday} sub="clientes encostaram" accent="from-amber-300 to-orange-400" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <h2 className="font-bold text-white">Últimas configurações</h2>
        <Link href="/painel/vendas" className="text-sm font-semibold text-brand-600">ver todas</Link>
      </div>
      {last.length === 0 && <p className="text-sm text-slate-500">Nenhuma placa ativada ainda.</p>}
      <div className="space-y-2">
        {last.map((p) => (
          <Link key={p.id} href={platePath(p.code)} className="card flex items-center gap-3 p-3">
            {p.kind && <KindIcon kind={p.kind} />}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{p.client?.name ?? "—"}</p>
              <p className="text-xs text-slate-500">{p.code} · {p.kind ? KIND_LABEL[p.kind] : ""}</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-semibold text-white/80">{p.activatedBy?.name.split(" ")[0] ?? ""}</p>
              <p className="text-slate-500">{p.activatedAt ? dateTime(p.activatedAt) : ""}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: number; sub: string; accent: string }) {
  return (
    <div className="card relative overflow-hidden">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      <p className="flex items-center gap-1.5 text-xs font-semibold text-white/55">
        <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-[#05070d]`}>{icon}</span>
        {label}
      </p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-white">{value}</p>
      <p className="text-xs text-white/45">{sub}</p>
    </div>
  );
}
