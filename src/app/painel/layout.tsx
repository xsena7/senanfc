import Link from "next/link";
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
    { href: "/painel/vendas", label: "Vendas", icon: "wallet" as const },
    ...(admin ? [{ href: "/painel/placas", label: "Placas", icon: "tags" as const }, { href: "/painel/equipe", label: "Equipe", icon: "users" as const }] : []),
  ];
  return (
    <div className="mx-auto min-h-dvh max-w-2xl pb-24">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/painel"><Logo className="text-lg" /></Link>
        <form action={logoutAction} className="flex items-center gap-3 text-sm text-slate-500">
          <span>{user.name.split(" ")[0]}</span>
          <button className="font-semibold text-slate-700">Sair</button>
        </form>
      </header>
      <div className="px-4">{children}</div>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-2xl">
          {items.map((i) => (
            <NavLink key={i.href} {...i} />
          ))}
        </div>
      </nav>
    </div>
  );
}
