import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AuthShell } from "@/components/auth-shell";
import { SetupForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if ((await db.user.count()) > 0) redirect("/login");
  return (
    <AuthShell title="Primeiro acesso" subtitle="Crie a sua conta de dono. Depois você cadastra o vendedor em Equipe.">
      <SetupForm />
    </AuthShell>
  );
}
