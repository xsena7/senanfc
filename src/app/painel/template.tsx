// Re-monta a cada troca de tela: dá a animação de entrada
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="fade-up space-y-0">{children}</div>;
}
