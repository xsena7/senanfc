export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="snfc-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b6ef6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#snfc-g)" />
      <g fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round">
        <path d="M24 23a13 13 0 0 1 0 18" />
        <path d="M32 17a21 21 0 0 1 0 30" />
        <path d="M40 11a29 29 0 0 1 0 42" opacity=".7" />
      </g>
      <circle cx="16" cy="32" r="4" fill="#fff" />
    </svg>
  );
}

export function Logo({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <LogoMark className="h-[1.6em] w-[1.6em]" />
      <span>
        Sena<span className={dark ? "text-cyan-300" : "text-brand-600"}>NFC</span>
      </span>
    </span>
  );
}
