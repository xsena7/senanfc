import Link from "next/link";
import { KindIcon } from "@/components/icons";
import { KitView, PixView, type PublicClient } from "@/components/public-views";
import { KIND_LABEL, type PlateKindT } from "@/lib/catalog";

export const metadata = { title: "Demonstração · Sena NFC" };

// Loja de mentira para mostrar ao cliente como fica
const DEMO: PublicClient = {
  name: "Sua Loja Aqui",
  whatsapp: "5562900000000",
  instagram: "sualoja",
  pixKey: "contato@sualoja.com.br",
  pixKeyType: "EMAIL",
  pixName: "Sua Loja Aqui",
  pixCity: "Goiania",
  googleUrl: "https://www.google.com/maps",
};

const TABS: { k: "PIX" | "KIT"; label: string }[] = [
  { k: "KIT", label: "Kit completo" },
  { k: "PIX", label: "Pix" },
];

export default async function Demo({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const v = (await searchParams).v === "PIX" ? "PIX" : "KIT";
  return (
    <div className="tech relative min-h-dvh">
      <div className="fixed inset-x-0 top-0 z-20 flex justify-center p-3">
        <div className="flex gap-1 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-xl">
          {TABS.map((t) => (
            <Link key={t.k} href={`/demo?v=${t.k}`} className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${v === t.k ? "bg-white text-slate-900" : "text-white/70"}`}>
              <KindIcon kind={t.k as PlateKindT} size="sm" />
              {t.label === "Pix" ? KIND_LABEL.PIX : t.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="pt-12">{v === "PIX" ? <PixView c={{ ...DEMO, pixKey: DEMO.pixKey!, pixKeyType: "EMAIL" }} /> : <KitView c={DEMO} />}</div>
    </div>
  );
}
