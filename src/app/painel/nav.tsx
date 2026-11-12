"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, House, Store, Tags, Users } from "lucide-react";

const ICONS = { activity: Activity, house: House, store: Store, tags: Tags, users: Users };

export function NavLink({ href, label, icon }: { href: string; label: string; icon: keyof typeof ICONS }) {
  const path = usePathname();
  const on = href === "/painel" ? path === href : path.startsWith(href);
  const Icon = ICONS[icon];
  return (
    <Link
      href={href}
      className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition ${on ? "bg-gradient-to-b from-brand-500/25 to-cyan-400/10 text-white" : "text-white/45 hover:text-white/80"}`}
    >
      {on && <span className="absolute -top-1.5 h-1 w-6 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.8)]" />}
      <Icon className="h-5 w-5" strokeWidth={on ? 2.4 : 1.8} />
      {label}
    </Link>
  );
}
