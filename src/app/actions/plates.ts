"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { normalizeCode, platePath, seqCode } from "@/lib/codes";
import { missingForKind, parseClient } from "@/lib/client-form";
import type { PlateKindT } from "@/lib/catalog";
import type { FormState } from "./auth";

const KINDS: PlateKindT[] = ["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP", "KIT"];

/** Liga uma placa nova a um estabelecimento (novo ou já cadastrado). Só configuração, sem valores. */
export async function activatePlateAction(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser();
  const code = normalizeCode(String(f.get("code") ?? ""));
  const plate = await db.plate.findUnique({ where: { code } });
  if (!plate) return { error: "Placa não encontrada." };
  if (plate.status !== "BLANK") return { error: "Essa placa já foi ativada." };

  const kind = String(f.get("kind") ?? "") as PlateKindT;
  if (!KINDS.includes(kind)) return { error: "Escolha do que a placa vai ser." };

  const parsed = parseClient(f);
  if (!parsed.data) return { error: parsed.error };
  const missing = missingForKind(parsed.data, kind);
  if (missing) return { error: missing };

  const clientId = String(f.get("clientId") ?? "");

  try {
    await db.$transaction(async (tx) => {
      const client = clientId
        ? await tx.client.update({ where: { id: clientId }, data: parsed.data! })
        : await tx.client.create({ data: parsed.data! });

      const r = await tx.plate.updateMany({
        where: { id: plate.id, status: "BLANK" },
        data: { status: "ACTIVE", kind, clientId: client.id, activatedAt: new Date(), activatedById: user.id },
      });
      if (r.count !== 1) throw new Error("Essa placa já foi ativada.");
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não deu certo. Tente de novo." };
  }

  revalidatePath("/painel", "layout");
  redirect(`${platePath(code)}?ok=1`);
}

export async function changeKindAction(f: FormData) {
  await requireUser();
  const id = String(f.get("plateId"));
  const kind = String(f.get("kind")) as PlateKindT;
  if (!KINDS.includes(kind)) return;
  const plate = await db.plate.findUnique({ where: { id }, include: { client: true } });
  if (!plate?.client) return;
  if (missingForKind(plate.client, kind)) {
    redirect(`/painel/clientes/${plate.client.id}?erro=${encodeURIComponent(missingForKind(plate.client, kind)!)}`);
  }
  await db.plate.update({ where: { id }, data: { kind } });
  revalidatePath(`/painel/clientes/${plate.client.id}`);
}

export async function setPlateStatusAction(f: FormData) {
  await requireUser();
  const id = String(f.get("plateId"));
  const status = String(f.get("status"));
  const plate = await db.plate.findUnique({ where: { id } });
  if (!plate) return;
  if (status === "DISABLED" && plate.status === "ACTIVE") await db.plate.update({ where: { id }, data: { status: "DISABLED" } });
  if (status === "ACTIVE" && plate.status === "DISABLED" && plate.clientId) await db.plate.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath("/painel", "layout");
}

/** Volta a placa para "nova" (sem cliente). Só o admin. */
export async function resetPlateAction(f: FormData) {
  await requireAdmin();
  const id = String(f.get("plateId"));
  await db.plate.update({
    where: { id },
    data: { status: "BLANK", kind: null, clientId: null, saleId: null, activatedAt: null, activatedById: null },
  });
  await db.tap.deleteMany({ where: { plateId: id } });
  revalidatePath("/painel", "layout");
}

export async function createBatchAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const qty = Number(f.get("qty"));
  if (!Number.isInteger(qty) || qty < 1 || qty > 500) return { error: "Quantidade de 1 a 500." };
  // Continua a contagem: SNFC1, SNFC2, ...
  const last = await db.plate.aggregate({ _max: { batch: true, seq: true } });
  const batch = (last._max.batch ?? 0) + 1;
  const start = (last._max.seq ?? 0) + 1;
  const data = Array.from({ length: qty }, (_, i) => ({ seq: start + i, code: seqCode(start + i), batch }));
  try {
    await db.plate.createMany({ data });
  } catch {
    return { error: "Não deu certo (outro lote foi criado ao mesmo tempo). Tente de novo." };
  }
  redirect(`/painel/placas/lote/${batch}`);
}

export async function markWrittenAction(plateId: string, written: boolean) {
  await requireAdmin();
  await db.plate.update({ where: { id: plateId }, data: { writtenAt: written ? new Date() : null } });
}
