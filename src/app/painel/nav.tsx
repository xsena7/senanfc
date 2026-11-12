"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const path = usePathname();
  const on = href === "/painel" ? path === href : path.startsWith(href);
  return (
    <Link href={href} className={`flex flex-1 flex-col items-center py-2 text-xs font-semibold ${on ? "text-brand-600" : "text-slate-500"}`}>
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );
}
