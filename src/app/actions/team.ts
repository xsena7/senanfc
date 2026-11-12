"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { hashPassword, requireAdmin } from "@/lib/auth";
import type { FormState } from "./auth";

export async function createUserAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(f.get("name") ?? "").trim();
  const login = String(f.get("login") ?? "").trim().toLowerCase();
  const password = String(f.get("password") ?? "");
  const role = f.get("role") === "ADMIN" ? "ADMIN" : "SELLER";
  if (!name) return { error: "Coloque o nome." };
  if (!/^[a-z0-9._-]{3,30}$/.test(login)) return { error: "Usuário: só letras minúsculas, números e ponto (mín. 3)." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  if (await db.user.findUnique({ where: { login } })) return { error: "Esse usuário já existe." };
  await db.user.create({ data: { name, login, role, passwordHash: await hashPassword(password) } });
  revalidatePath("/painel/equipe");
  return { ok: `Pronto! ${name} entra com o usuário "${login}".` };
}

export async function toggleUserAction(f: FormData) {
  const me = await requireAdmin();
  const id = String(f.get("userId"));
  if (id === me.id) return;
  const u = await db.user.findUnique({ where: { id } });
  if (!u) return;
  await db.user.update({ where: { id }, data: { active: !u.active } });
  if (u.active) await db.session.deleteMany({ where: { userId: id } });
  revalidatePath("/painel/equipe");
}

export async function resetPasswordAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(f.get("userId"));
  const password = String(f.get("password") ?? "");
  if (password.length < 8) return { error: "Mínimo 8 caracteres." };
  await db.user.update({ where: { id }, data: { passwordHash: await hashPassword(password) } });
  await db.session.deleteMany({ where: { userId: id } });
  return { ok: "Senha trocada." };
}
