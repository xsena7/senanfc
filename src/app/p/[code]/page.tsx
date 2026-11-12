import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { normalizeCode } from "@/lib/codes";
import { instagramUrl, whatsappUrl } from "@/lib/links";
import { PRODUCT_PLATES } from "@/lib/catalog";
import { CircleHelp, Pause, Sparkles } from "lucide-react";
import { KitView, NoticeView, PixView } from "@/components/public-views";
import { ActivateForm } from "./activate";
import { ManagePlate } from "./manage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const plate = await db.plate.findUnique({ where: { code: normalizeCode((await params).code) }, include: { client: true } });
  return { title: plate?.client?.name ?? "Sena NFC", robots: { index: false } };
}

export default async function PlatePage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ ver?: string; ok?: string }> }) {
  const code = normalizeCode((await params).code);
  const sp = await searchParams;
  const plate = await db.plate.findUnique({ where: { code }, include: { client: true } });
  const user = await currentUser();

  if (!plate) return <NoticeView icon={<CircleHelp className="h-7 w-7" />} title="Placa não encontrada" text="Confira o código da placa." />;

  // Vendedor logado: ativa ou administra a placa
  if (user && !sp.ver) {
    if (plate.status === "BLANK") {
      const clients = await db.client.findMany({
        orderBy: { createdAt: "desc" },
        take: 500,
        include: { sales: { where: { product: "DUO" }, include: { _count: { select: { plates: true } } }, orderBy: { createdAt: "desc" }, take: 5 } },
      });
      const list = clients.map(({ sales, createdAt, ...c }) => ({
        ...c,
        openSales: sales
          .filter((s) => s._count.plates < PRODUCT_PLATES[s.product])
          .map((s) => ({ id: s.id, when: s.createdAt.toISOString(), missing: PRODUCT_PLATES[s.product] - s._count.plates })),
      }));
      return (
        <main className="mx-auto max-w-md px-4 py-6">
          <ActivateForm code={code} clients={list} />
        </main>
      );
    }
    return (
      <main className="mx-auto max-w-md px-4 py-6">
        <ManagePlate code={code} justActivated={sp.ok === "1"} isAdmin={user.role === "ADMIN"} />
      </main>
    );
  }

  if (plate.status === "BLANK") return <NoticeView icon={<Sparkles className="h-7 w-7" />} title="Placa nova" text="Essa placa ainda não foi ativada. Fale com quem te vendeu." />;
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
