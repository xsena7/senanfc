import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await db.user.count()) === 0) redirect("/setup");
  if (await currentUser()) redirect("/painel");
  const { next } = await searchParams;
  return (
    <AuthShell title="Bem-vindo de volta" subtitle="Entre para ativar e configurar placas">
      <LoginForm next={next ?? ""} />
    </AuthShell>
  );
}
