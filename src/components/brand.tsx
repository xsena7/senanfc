export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden>
        <rect width="64" height="64" rx="14" fill="#2554e8" />
        <g fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round">
          <path d="M22 22a14 14 0 0 1 0 20" />
          <path d="M30 16a22 22 0 0 1 0 32" />
          <path d="M38 10a30 30 0 0 1 0 44" />
        </g>
        <circle cx="15" cy="32" r="4" fill="#fff" />
      </svg>
      <span>
        Sena<span className="text-brand-600">NFC</span>
      </span>
    </span>
  );
}
