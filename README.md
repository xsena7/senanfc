# Sena NFC

Placas por aproximação (NFC) para comércios: Pix, avaliação Google, Instagram e WhatsApp num toque.

## Colocar no ar (Vercel + Neon, grátis)
1. vercel.com → entrar com o GitHub → **Add New → Project** → importar `senanfc` → **Deploy**.
2. No projeto: **Storage → Create Database → Neon** → conectar ao projeto (cria `DATABASE_URL` e `DATABASE_URL_UNPOOLED`).
3. **Settings → Environment Variables**: `PUBLIC_URL` = `https://senanfc.com.br`.
4. **Deployments → Redeploy**.
5. **Settings → Domains**: adicionar `senanfc.com.br` e seguir o que a Vercel pedir no registro.br.
6. Abrir o site → `/setup` → criar a conta de dono.

## Uso
- **Placas → Gerar lote**: cria os códigos. Grave cada link numa etiqueta (NFC Tools → Gravar → URL) e **trave** (Outros → Bloquear etiqueta).
- **Equipe**: crie o login do vendedor.
- Na rua: o vendedor (logado) encosta o iPhone na placa nova → preenche → **Ativar placa**.
