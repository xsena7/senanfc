"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Store, Tags, Users, Wallet } from "lucide-react";

const ICONS = { house: House, store: Store, wallet: Wallet, tags: Tags, users: Users };

export function NavLink({ href, label, icon }: { href: string; label: string; icon: keyof typeof ICONS }) {
  const path = usePathname();
  const on = href === "/painel" ? path === href : path.startsWith(href);
  const Icon = ICONS[icon];
  return (
    <Link href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${on ? "text-brand-600" : "text-slate-500"}`}>
      <Icon className="h-6 w-6" strokeWidth={on ? 2.4 : 1.8} />
      {label}
    </Link>
  );
}
