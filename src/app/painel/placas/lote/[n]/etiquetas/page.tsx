import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PrintButton } from "./print";

export const dynamic = "force-dynamic";

/** Adesivinhos com o código, para colar atrás de cada placa. */
export default async function Etiquetas({ params }: { params: Promise<{ n: string }> }) {
  await requireAdmin();
  const batch = Number((await params).n);
  if (!Number.isInteger(batch)) notFound();
  const plates = await db.plate.findMany({ where: { batch }, orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-extrabold">Etiquetas · Lote {batch}</h1>
        <PrintButton />
      </div>
      <div className="grid grid-cols-4 gap-2 bg-white p-2">
        {plates.map((p) => (
          <div key={p.id} className="rounded border border-dashed border-slate-400 p-2 text-center">
            <p className="text-[10px] text-slate-500">senanfc.com.br</p>
            <p className="font-mono text-base font-bold">{p.code}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
