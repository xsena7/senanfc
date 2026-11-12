import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { normalizeCode } from "@/lib/codes";
import { instagramUrl, whatsappUrl } from "@/lib/links";
import { KIND_EMOJI, KIND_LABEL, PRODUCT_PLATES } from "@/lib/catalog";
import { Logo } from "@/components/brand";
import { PixBox } from "@/components/pix-box";
import { ActivateForm } from "./activate";
import { ManagePlate } from "./manage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }) {
  const plate = await db.plate.findUnique({ where: { code: normalizeCode((await params).code) }, include: { client: true } });
  return { title: plate?.client?.name ?? "Sena NFC", robots: { index: false } };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-6">
      <div className="flex-1">{children}</div>
      <p className="mt-10 text-center text-xs text-slate-400">
        <Link href="/">feito com <Logo className="text-xs" /></Link>
      </p>
    </main>
  );
}

function Notice({ emoji, title, text }: { emoji: string; title: string; text: string }) {
  return (
    <Shell>
      <div className="card mt-16 text-center">
        <p className="text-5xl">{emoji}</p>
        <h1 className="mt-3 text-xl font-bold">{title}</h1>
        <p className="mt-2 text-slate-600">{text}</p>
      </div>
    </Shell>
  );
}

export default async function PlatePage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ ver?: string; ok?: string }> }) {
  const code = normalizeCode((await params).code);
  const sp = await searchParams;
  const plate = await db.plate.findUnique({ where: { code }, include: { client: true } });
  const user = await currentUser();

  if (!plate) return <Notice emoji="🤔" title="Placa não encontrada" text="Confira o código da placa." />;

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

  if (plate.status === "BLANK") return <Notice emoji="✨" title="Placa nova" text="Essa placa ainda não foi ativada. Fale com quem te vendeu." />;
  if (plate.status === "DISABLED" || !plate.client || !plate.kind)
    return <Notice emoji="⏸️" title="Placa desativada" text="Essa placa está desligada no momento." />;

  if (!user) await db.tap.create({ data: { plateId: plate.id } });
  const c = plate.client;

  if (plate.kind === "WHATSAPP" && c.whatsapp) redirect(whatsappUrl(c.whatsapp));
  if (plate.kind === "INSTAGRAM" && c.instagram) redirect(instagramUrl(c.instagram));
  if (plate.kind === "GOOGLE" && c.googleUrl) redirect(c.googleUrl);

  if (plate.kind === "PIX" && c.pixKey && c.pixKeyType) {
    return (
      <Shell>
        <p className="text-center text-sm font-semibold text-emerald-700">💠 Pague com Pix</p>
        <h1 className="mt-1 text-center text-2xl font-extrabold">{c.name}</h1>
        <div className="card mt-5">
          <PixBox c={{ ...c, pixKey: c.pixKey, pixKeyType: c.pixKeyType }} />
        </div>
      </Shell>
    );
  }

  // Kit: página da loja com os botões que ela tiver
  const links = [
    c.googleUrl && { href: c.googleUrl, kind: "GOOGLE" as const, text: "Avalie a gente no Google", cls: "bg-amber-400 text-slate-900 hover:bg-amber-500" },
    c.instagram && { href: instagramUrl(c.instagram), kind: "INSTAGRAM" as const, text: `Siga @${c.instagram}`, cls: "bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white" },
    c.whatsapp && { href: whatsappUrl(c.whatsapp), kind: "WHATSAPP" as const, text: "Chamar no WhatsApp", cls: "bg-green-600 text-white hover:bg-green-700" },
  ].filter(Boolean) as { href: string; kind: "GOOGLE" | "INSTAGRAM" | "WHATSAPP"; text: string; cls: string }[];

  if (!links.length && !c.pixKey) return <Notice emoji="⏸️" title="Placa sem links" text="Essa placa ainda não tem links cadastrados." />;

  return (
    <Shell>
      <h1 className="mt-4 text-center text-3xl font-extrabold">{c.name}</h1>
      <p className="mt-1 text-center text-slate-500">Que bom ter você aqui! 💙</p>
      <div className="mt-6 space-y-3">
        {links.map((l) => (
          <a key={l.kind} href={l.href} className={`btn w-full py-4 text-lg ${l.cls}`}>
            {KIND_EMOJI[l.kind]} {l.text}
          </a>
        ))}
      </div>
      {c.pixKey && c.pixKeyType && (
        <div className="card mt-5">
          <p className="mb-3 text-center font-semibold">{KIND_EMOJI.PIX} {KIND_LABEL.PIX}</p>
          <PixBox c={{ ...c, pixKey: c.pixKey, pixKeyType: c.pixKeyType }} />
        </div>
      )}
    </Shell>
  );
}
