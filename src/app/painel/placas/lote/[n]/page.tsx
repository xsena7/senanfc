import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { plateUrl } from "@/lib/codes";
import { BatchWriter } from "./writer";
import { Printer } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Lote({ params }: { params: Promise<{ n: string }> }) {
  await requireAdmin();
  const batch = Number((await params).n);
  if (!Number.isInteger(batch)) notFound();
  const plates = await db.plate.findMany({ where: { batch }, orderBy: [{ seq: "asc" }, { createdAt: "asc" }], include: { client: true } });
  if (!plates.length) notFound();
  return (
    <div className="space-y-4">
      <Link href="/painel/placas" className="text-sm font-semibold text-brand-600">← Placas</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Lote {batch}</h1>
        <Link href={`/painel/placas/lote/${batch}/etiquetas`} className="btn-ghost btn-sm"><Printer className="h-4 w-4" /> Etiquetas com código</Link>
      </div>
      <BatchWriter
        plates={plates.map((p) => ({ id: p.id, code: p.code, url: plateUrl(p.code), written: !!p.writtenAt, status: p.status, client: p.client?.name ?? null }))}
      />
    </div>
  );
}
