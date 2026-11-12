import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Logo } from "@/components/brand";
import { LoginForm } from "./form";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if ((await db.user.count()) === 0) redirect("/setup");
  if (await currentUser()) redirect("/painel");
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <Logo className="mb-8 justify-center text-2xl" />
      <LoginForm next={next ?? ""} />
    </main>
  );
}
