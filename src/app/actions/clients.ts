"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { missingForKind, parseClient } from "@/lib/client-form";
import { KIND_LABEL } from "@/lib/catalog";
import type { FormState } from "./auth";

export async function updateClientAction(_: FormState, f: FormData): Promise<FormState> {
  await requireUser();
  const id = String(f.get("clientId"));
  const parsed = parseClient(f);
  if (!parsed.data) return { error: parsed.error };
  // Não deixa apagar o link que uma placa ativa usa
  const plates = await db.plate.findMany({ where: { clientId: id, status: "ACTIVE" } });
  for (const p of plates) {
    const miss = p.kind && missingForKind(parsed.data, p.kind);
    if (miss) return { error: `A placa ${p.code} (${KIND_LABEL[p.kind!]}) precisa desse dado. ${miss}` };
  }
  await db.client.update({ where: { id }, data: parsed.data });
  revalidatePath(`/painel/clientes/${id}`);
  return { ok: "Salvo! As placas já abrem com os dados novos." };
}
