"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { newCode, normalizeCode } from "@/lib/codes";
import { missingForKind, parseClient } from "@/lib/client-form";
import { PRODUCT_PLATES, PRODUCT_PRICE, type PaymentT, type PlateKindT, type ProductT } from "@/lib/catalog";
import type { FormState } from "./auth";

const KINDS: PlateKindT[] = ["PIX", "GOOGLE", "INSTAGRAM", "WHATSAPP", "KIT"];
const PAYMENTS: PaymentT[] = ["PIX", "DINHEIRO", "CARTAO", "PENDENTE"];

/** Liga uma placa nova a um cliente (novo ou já cadastrado) e registra a venda. */
export async function activatePlateAction(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser();
  const code = normalizeCode(String(f.get("code") ?? ""));
  const plate = await db.plate.findUnique({ where: { code } });
  if (!plate) return { error: "Placa não encontrada." };
  if (plate.status !== "BLANK") return { error: "Essa placa já foi ativada." };

  const kind = String(f.get("kind") ?? "") as PlateKindT;
  if (!KINDS.includes(kind)) return { error: "Escolha o que a placa vai abrir." };

  const parsed = parseClient(f);
  if (!parsed.data) return { error: parsed.error };
  const missing = missingForKind(parsed.data, kind);
  if (missing) return { error: missing };

  // Venda: "new:SINGLE", "new:DUO", "new:KIT", "join:<saleId>" ou "none"
  const saleChoice = String(f.get("sale") ?? "");
  const payment = String(f.get("payment") ?? "") as PaymentT;
  if (saleChoice.startsWith("new:") && !PAYMENTS.includes(payment)) return { error: "Escolha como o cliente pagou." };

  const clientId = String(f.get("clientId") ?? "");

  try {
    await db.$transaction(async (tx) => {
      const client = clientId
        ? await tx.client.update({ where: { id: clientId }, data: parsed.data! })
        : await tx.client.create({ data: parsed.data! });

      let saleId: string | null = null;
      if (saleChoice.startsWith("new:")) {
        const product = saleChoice.slice(4) as ProductT;
        if (!(product in PRODUCT_PRICE)) throw new Error("Escolha a venda.");
        if (product === "KIT" && kind !== "KIT") throw new Error("O kit 4 links é uma placa só: escolha 'Kit 4 links' no que a placa abre.");
        const sale = await tx.sale.create({
          data: {
            clientId: client.id,
            sellerId: user.id,
            product,
            priceCents: PRODUCT_PRICE[product],
            payment,
            paidAt: payment === "PENDENTE" ? null : new Date(),
          },
        });
        saleId = sale.id;
      } else if (saleChoice.startsWith("join:")) {
        const sale = await tx.sale.findUnique({ where: { id: saleChoice.slice(5) }, include: { _count: { select: { plates: true } } } });
        if (!sale || sale.clientId !== client.id) throw new Error("Venda não encontrada para esse cliente.");
        if (sale._count.plates >= PRODUCT_PLATES[sale.product]) throw new Error("Essa venda já está com todas as placas.");
        saleId = sale.id;
      } else if (saleChoice !== "none") {
        throw new Error("Escolha a venda.");
      }

      const r = await tx.plate.updateMany({
        where: { id: plate.id, status: "BLANK" },
        data: { status: "ACTIVE", kind, clientId: client.id, saleId, activatedAt: new Date(), activatedById: user.id },
      });
      if (r.count !== 1) throw new Error("Essa placa já foi ativada.");
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não deu certo. Tente de novo." };
  }

  revalidatePath("/painel");
  redirect(`/p/${code}?ok=1`);
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
  const last = await db.plate.aggregate({ _max: { batch: true } });
  const batch = (last._max.batch ?? 0) + 1;
  const codes = new Set<string>();
  while (codes.size < qty) codes.add(newCode());
  const taken = await db.plate.findMany({ where: { code: { in: [...codes] } }, select: { code: true } });
  for (const t of taken) codes.delete(t.code);
  await db.plate.createMany({ data: [...codes].map((code) => ({ code, batch })) });
  redirect(`/painel/placas/lote/${batch}`);
}

export async function markWrittenAction(plateId: string, written: boolean) {
  await requireAdmin();
  await db.plate.update({ where: { id: plateId }, data: { writtenAt: written ? new Date() : null } });
}
