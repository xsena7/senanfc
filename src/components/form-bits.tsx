"use client";
import { useFormStatus } from "react-dom";
import { useState } from "react";

export function Submit({ children, className = "btn-primary w-full", pending = "Salvando..." }: { children: React.ReactNode; className?: string; pending?: string }) {
  const { pending: p } = useFormStatus();
  return (
    <button type="submit" disabled={p} className={className}>
      {p ? pending : children}
    </button>
  );
}

export function Msg({ state }: { state?: { error?: string; ok?: string } }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p>;
  if (state.ok) return <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{state.ok}</p>;
  return null;
}

export function CopyButton({ text, label, className = "btn-primary w-full" }: { text: string; label: string; className?: string }) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const t = document.createElement("textarea");
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 2500);
  }
  return (
    <button type="button" onClick={copy} className={className}>
      {done ? "✅ Copiado!" : label}
    </button>
  );
}

export function ConfirmButton({ children, message, className }: { children: React.ReactNode; message: string; className: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
