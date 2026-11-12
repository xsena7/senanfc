import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Logo } from "@/components/brand";
import { SetupForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if ((await db.user.count()) > 0) redirect("/login");
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <Logo className="mb-4 justify-center text-2xl" />
      <p className="mb-6 text-center text-sm text-slate-600">Primeiro acesso: crie a sua conta de dono. Depois você cadastra o vendedor em Equipe.</p>
      <SetupForm />
    </main>
  );
}
