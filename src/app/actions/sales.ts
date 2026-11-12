"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import type { PaymentT } from "@/lib/catalog";

export async function markPaidAction(f: FormData) {
  const user = await requireUser();
  const id = String(f.get("saleId"));
  const payment = String(f.get("payment")) as PaymentT;
  if (!["PIX", "DINHEIRO", "CARTAO"].includes(payment)) return;
  const sale = await db.sale.findUnique({ where: { id } });
  if (!sale || (user.role !== "ADMIN" && sale.sellerId !== user.id)) return;
  await db.sale.update({ where: { id }, data: { payment, paidAt: new Date() } });
  revalidatePath("/painel", "layout");
}

/** Apaga a venda (as placas continuam com o cliente). Só o admin. */
export async function deleteSaleAction(f: FormData) {
  await requireAdmin();
  const id = String(f.get("saleId"));
  await db.$transaction([
    db.plate.updateMany({ where: { saleId: id }, data: { saleId: null } }),
    db.sale.delete({ where: { id } }),
  ]);
  revalidatePath("/painel", "layout");
}
