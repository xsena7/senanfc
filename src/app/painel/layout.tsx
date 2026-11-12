import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/brand";
import { NavLink } from "./nav";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const admin = user.role === "ADMIN";
  const items = [
    { href: "/painel", label: "Início", icon: "house" as const },
    { href: "/painel/clientes", label: "Clientes", icon: "store" as const },
    { href: "/painel/vendas", label: "Vendas", icon: "activity" as const },
    ...(admin ? [{ href: "/painel/placas", label: "Placas", icon: "tags" as const }, { href: "/painel/equipe", label: "Equipe", icon: "users" as const }] : []),
  ];
  return (
    <div className="tech panel min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#05070d]/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/painel"><Logo className="text-lg text-white" dark /></Link>
          <form action={logoutAction} className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-400 text-xs font-bold text-white">{user.name[0]?.toUpperCase()}</span>
              <span className="text-white/80">{user.name.split(" ")[0]}</span>
            </span>
            <button className="rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Sair"><LogOut className="h-4 w-4" /></button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4 pb-28 pt-4">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="mx-auto flex max-w-md rounded-2xl border border-white/10 bg-[#0a0e19]/85 p-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,.8)] backdrop-blur-xl">
          {items.map((i) => (
            <NavLink key={i.href} {...i} />
          ))}
        </div>
      </nav>
    </div>
  );
}
