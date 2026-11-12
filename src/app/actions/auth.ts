"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkPassword, endSession, hashPassword, startSession } from "@/lib/auth";

export type FormState = { error?: string; ok?: string } | undefined;

export async function loginAction(_: FormState, f: FormData): Promise<FormState> {
  const login = String(f.get("login") ?? "").trim().toLowerCase();
  const password = String(f.get("password") ?? "");
  const user = await db.user.findUnique({ where: { login } });
  if (!user || !user.active || !(await checkPassword(password, user.passwordHash)))
    return { error: "Usuário ou senha errados." };
  await startSession(user.id);
  const next = String(f.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/painel");
}

export async function setupAction(_: FormState, f: FormData): Promise<FormState> {
  if ((await db.user.count()) > 0) return { error: "O sistema já foi configurado. Entre pelo login." };
  const name = String(f.get("name") ?? "").trim();
  const login = String(f.get("login") ?? "").trim().toLowerCase();
  const password = String(f.get("password") ?? "");
  if (!name || !login) return { error: "Preencha nome e usuário." };
  if (!/^[a-z0-9._-]{3,30}$/.test(login)) return { error: "Usuário: só letras minúsculas, números e ponto (mín. 3)." };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres." };
  const user = await db.user.create({ data: { name, login, passwordHash: await hashPassword(password), role: "ADMIN" } });
  await startSession(user.id);
  redirect("/painel");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
