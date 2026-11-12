import Link from "next/link";
import { Logo } from "@/components/brand";

export default function Home() {
  const items = [
    ["💠", "Pix", "O cliente encosta o celular e copia o seu Pix."],
    ["⭐", "Avaliação Google", "Abre direto a tela de dar 5 estrelas."],
    ["📸", "Instagram", "Abre o seu perfil para seguir."],
    ["💬", "WhatsApp", "Abre a conversa com a sua loja."],
  ];
  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="flex items-center justify-between">
        <Logo className="text-xl" />
        <Link href="/login" className="text-sm font-semibold text-brand-600">Entrar</Link>
      </div>
      <h1 className="mt-10 text-3xl font-extrabold leading-tight">Encostou, abriu.</h1>
      <p className="mt-3 text-slate-600">Placas de mesa por aproximação para o seu comércio em Goiânia. Sem QR Code, sem app: o cliente só encosta o celular.</p>
      <div className="mt-8 space-y-3">
        {items.map(([e, t, d]) => (
          <div key={t} className="card flex items-start gap-3">
            <span className="text-2xl">{e}</span>
            <div>
              <p className="font-semibold">{t}</p>
              <p className="text-sm text-slate-600">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-slate-500">Mudou o Pix ou o Instagram? A gente atualiza, sem trocar a placa.</p>
    </main>
  );
}
