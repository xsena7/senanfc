import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { normalizeCode, platePath } from "@/lib/codes";
import { instagramUrl, whatsappUrl } from "@/lib/links";
import { CircleHelp, Pause, Sparkles } from "lucide-react";
import { KitView, NoticeView, PixView } from "@/components/public-views";
import { ActivateForm } from "./activate";
import { ManagePlate } from "./manage";

export async function plateMetadata(raw: string) {
  const plate = await db.plate.findUnique({ where: { code: normalizeCode(raw) }, include: { client: true } });
  return { title: plate?.client?.name ?? "Sena NFC", robots: { index: false } };
}

/** Página da placa: usada em /SNFC<n> e em /p/<código> (códigos antigos). */
export async function PlatePage({ raw, sp }: { raw: string; sp: { ver?: string; ok?: string } }) {
  const code = normalizeCode(raw);
  const plate = await db.plate.findUnique({ where: { code }, include: { client: true } });
  const user = await currentUser();

  if (!plate) return <NoticeView icon={<CircleHelp className="h-7 w-7" />} title="Placa não encontrada" text="Confira o código da placa." />;

  // Vendedor logado: ativa ou administra a placa
  if (user && !sp.ver) {
    if (plate.status === "BLANK") {
      const clients = await db.client.findMany({
        orderBy: { name: "asc" },
        take: 1000,
        include: { plates: { where: { status: { not: "BLANK" } }, select: { code: true, kind: true, status: true } } },
      });
      const list = clients.map(({ createdAt, notes, ...c }) => ({ ...c, notes, plates: c.plates.map((p) => ({ code: p.code, kind: p.kind, off: p.status === "DISABLED" })) }));
      return (
        <main className="tech panel min-h-dvh">
          <div className="fade-up mx-auto max-w-md px-4 pb-6 pt-[max(env(safe-area-inset-top),1.5rem)]">
            <ActivateForm code={code} clients={list} />
          </div>
        </main>
      );
    }
    return (
      <main className="tech panel min-h-dvh">
        <div className="fade-up mx-auto max-w-md px-4 pb-6 pt-[max(env(safe-area-inset-top),1.5rem)]">
          <ManagePlate code={code} justActivated={sp.ok === "1"} isAdmin={user.role === "ADMIN"} />
        </div>
      </main>
    );
  }

  if (plate.status === "BLANK") return <NoticeView icon={<Sparkles className="h-7 w-7" />} title="Placa nova" text="Essa placa ainda não foi ativada. Fale com quem te vendeu." action={{ href: `/login?next=${encodeURIComponent(platePath(code))}`, label: "Sou vendedor: entrar e ativar" }} />;
  if (plate.status === "DISABLED" || !plate.client || !plate.kind)
    return <NoticeView icon={<Pause className="h-7 w-7" />} title="Placa desativada" text="Essa placa está desligada no momento." />;

  if (!user) await db.tap.create({ data: { plateId: plate.id } });
  const c = plate.client;

  if (plate.kind === "WHATSAPP" && c.whatsapp) redirect(whatsappUrl(c.whatsapp));
  if (plate.kind === "INSTAGRAM" && c.instagram) redirect(instagramUrl(c.instagram));
  if (plate.kind === "GOOGLE" && c.googleUrl) redirect(c.googleUrl);
  if (plate.kind === "PIX" && c.pixKey && c.pixKeyType) return <PixView c={{ ...c, pixKey: c.pixKey, pixKeyType: c.pixKeyType }} />;
  if (!c.googleUrl && !c.instagram && !c.whatsapp && !c.pixKey)
    return <NoticeView icon={<Pause className="h-7 w-7" />} title="Placa sem links" text="Essa placa ainda não tem links cadastrados." />;
  return <KitView c={c} />;
}
