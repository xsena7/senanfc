# Sena NFC

Sistema para vender placas de mesa com etiqueta NFC em Goiânia (Pix, avaliação Google, Instagram, WhatsApp e Kit 4 links). Vendedor de rua usa iPhone.

## Como falar com o dono
- Sempre em português, simples e direto. Um passo de cada vez.
- Nunca pedir/aceitar senhas ou chaves no chat. O repositório é PÚBLICO: nunca commitar segredos.

## Ideia central
Cada etiqueta é gravada (e travada) em casa com um link em sequência `https://senanfc.com.br/SNFC1`, `/SNFC2`... (`Plate.seq`, `src/lib/codes.ts`; rota `src/app/[code]` só aceita `SNFC<n>`). Códigos antigos aleatórios continuam em `/p/<código>`. A página da placa fica em `src/app/p/[code]/plate-page.tsx`. O destino fica no banco, então dá para trocar Pix/Instagram/etc. sem mexer na placa.
- Vendedor logado encosta numa placa nova → tela de ativar (`src/app/p/[code]/activate.tsx`): 1) estabelecimento (sugere os já cadastrados), 2) do que é a placa (Instagram, WhatsApp, Google, Pix, Kit completo), 3) só os links daquela placa → Ativar. Comprou 2? Ativa uma, depois a outra.
- **Painel é só de configuração: sem valores nem pagamentos** (o vendedor recebe direto e dá desconto). A tabela `Sale` existe no banco mas não é usada. A aba "Vendas" (`src/app/painel/vendas`) mostra quantas placas foram configuradas, por quem e quando (`Plate.activatedAt/activatedById`).
- Clientes em gavetas (`src/app/painel/clientes`): abre e vê todas as placas do estabelecimento.
- Logado + placa ativa → tela de gerenciar (`manage.tsx`), com "Testar" (`?ver=1`).
- Público: WhatsApp/Instagram/Google redirecionam; Pix mostra a chave + "Pix copia e cola" (`src/lib/pix.ts`); Kit mostra página com botões. Toque só conta sem login (tabela `Tap`).

## Stack
Next.js 15 (App Router, server actions) · Prisma 6 + Postgres (Neon) · Tailwind 4 · hospedado na Vercel (build: `npm run vercel-build`, roda `prisma migrate deploy`).

## Onde fica cada coisa
- Nomes dos tipos de placa e preços mostrados só no site: `src/lib/catalog.ts`.
- Login (sessão em cookie `snfc`, tabela `Session`): `src/lib/auth.ts`. Primeiro acesso cria o dono em `/setup`.
- Validação dos dados do cliente: `src/lib/client-form.ts`, `src/lib/links.ts`, `src/lib/pix-key.ts`.
- Ações: `src/app/actions/*.ts`. Painel: `src/app/painel/*` (Placas e Equipe só para ADMIN).
- Lotes: `/painel/placas` gera códigos; o lote mostra os links para gravar no NFC Tools (iPhone) ou grava em sequência pelo Chrome do Android (Web NFC, com trava).

## Visual
- Site e páginas das placas: visual escuro "tecnológico" (classe `.tech`, `glass`, `text-glow` em `src/app/globals.css`). Página inicial em `src/app/page.tsx`, demonstração em `/demo`, telas públicas em `src/components/public-views.tsx`.
- Painel: escuro também (`tech panel` no layout; `.panel` em `globals.css` converte as classes claras como `bg-white`, `text-slate-500`), animação de entrada em `src/app/painel/template.tsx`, mobile-first. Ícones: `lucide-react` + logos das marcas em `src/components/icons.tsx` (`KindIcon`). Não usar emoji na interface.
- Botão "Quero minha placa" usa `CONTACT_WHATSAPP` (variável na Vercel).

## Link do Google (avaliação)
- O vendedor cola o link do Google Maps; `src/lib/google-resolve.ts` (ação `src/app/actions/google.ts`, campo `src/components/google-field.tsx`) segue o link curto só por domínios do Google e monta o link: com ID `ChIJ` no link → `search.google.com/local/writereview?placeid=`; com `GOOGLE_PLACES_API_KEY` (opcional) → pergunta o ID ao Google; sem chave e sem ID no link → avisa e mostra o gerador externo (o link `#lrd=` da busca do Google NÃO abre a avaliação no iPhone; testado).

## App (PWA)
- Manifesto em `src/app/manifest.ts` (abre em `/painel`), ícones PNG em `public/` (`icon-192/512`, `icon-maskable-512`, `apple-touch-icon`), service worker `public/sw.js` (só a página `offline.html`, não guarda telas do painel). Cartão "Instale o app" em `src/components/pwa.tsx`.
- No iPhone o NFC abre o link no Safari, que tem login separado do app instalado: por isso a tela "Placa nova" tem "Sou vendedor: entrar e ativar" (volta para a placa depois do login).

## Regras
- Mudou o schema: criar migration em `prisma/migrations/<timestamp>_<nome>/migration.sql` (`npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`).
- Visual mobile-first (o vendedor usa no celular), botões grandes, textos para leigo.

## Checar antes de subir
```
node_modules/.bin/tsc --noEmit -p .
npm test
npm run build
```
Teste local: Postgres (`pg_ctlcluster 16 main start`), `.env` a partir de `.env.example`, `npx prisma migrate deploy`, `next dev -p 3200`.
