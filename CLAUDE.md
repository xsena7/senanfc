# Sena NFC

Sistema para vender placas de mesa com etiqueta NFC em Goiânia (Pix, avaliação Google, Instagram, WhatsApp e Kit 4 links). Vendedor de rua usa iPhone.

## Como falar com o dono
- Sempre em português, simples e direto. Um passo de cada vez.
- Nunca pedir/aceitar senhas ou chaves no chat. O repositório é PÚBLICO: nunca commitar segredos.

## Ideia central
Cada etiqueta é gravada (e travada) em casa com um link único `https://senanfc.com.br/p/<CÓDIGO>`. O destino fica no banco, então dá para trocar Pix/Instagram/etc. sem mexer na placa.
- Vendedor logado encosta numa placa nova → tela de ativar (`src/app/p/[code]/activate.tsx`): escolhe o que abre, cliente (novo ou existente), venda e pagamento.
- Logado + placa ativa → tela de gerenciar (`manage.tsx`), com "Testar" (`?ver=1`).
- Público: WhatsApp/Instagram/Google redirecionam; Pix mostra a chave + "Pix copia e cola" (`src/lib/pix.ts`); Kit mostra página com botões. Toque só conta sem login (tabela `Tap`).

## Stack
Next.js 15 (App Router, server actions) · Prisma 6 + Postgres (Neon) · Tailwind 4 · hospedado na Vercel (build: `npm run vercel-build`, roda `prisma migrate deploy`).

## Onde fica cada coisa
- Preços e nomes de produto: `src/lib/catalog.ts` (1 placa 69,90 · 2 placas 100 · kit 139,90).
- Login (sessão em cookie `snfc`, tabela `Session`): `src/lib/auth.ts`. Primeiro acesso cria o dono em `/setup`.
- Validação dos dados do cliente: `src/lib/client-form.ts`, `src/lib/links.ts`, `src/lib/pix-key.ts`.
- Ações: `src/app/actions/*.ts`. Painel: `src/app/painel/*` (Placas e Equipe só para ADMIN; vendedor vê só as vendas dele).
- Lotes: `/painel/placas` gera códigos; o lote mostra os links para gravar no NFC Tools (iPhone) ou grava em sequência pelo Chrome do Android (Web NFC, com trava).

## Visual
- Site e páginas das placas: visual escuro "tecnológico" (classe `.tech`, `glass`, `text-glow` em `src/app/globals.css`). Página inicial em `src/app/page.tsx`, demonstração em `/demo`, telas públicas em `src/components/public-views.tsx`.
- Painel: claro, mobile-first. Ícones: `lucide-react` + logos das marcas em `src/components/icons.tsx` (`KindIcon`). Não usar emoji na interface.
- Botão "Quero minha placa" usa `CONTACT_WHATSAPP` (variável na Vercel).

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
