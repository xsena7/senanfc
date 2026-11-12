import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Search } from "lucide-react";
import { KindIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function Clientes({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser();
  const q = ((await searchParams).q ?? "").trim();
  const clients = await db.client.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { plates: { where: { status: { not: "BLANK" } } } },
  });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Clientes</h1>
      <form className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input name="q" defaultValue={q} className="input pl-10" placeholder="Buscar pelo nome da loja" />
      </form>
      {clients.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente. Eles aparecem aqui quando uma placa é ativada.</p>}
      {clients.map((c) => (
        <Link key={c.id} href={`/painel/clientes/${c.id}`} className="card flex items-center justify-between">
          <span className="font-semibold">{c.name}</span>
          <span className="flex gap-1">
            {c.plates.map((p) => (
              <span key={p.id} className={p.status === "DISABLED" ? "opacity-30 grayscale" : ""}>{p.kind ? <KindIcon kind={p.kind} size="sm" /> : null}</span>
            ))}
          </span>
        </Link>
      ))}
    </div>
  );
}
