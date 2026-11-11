# Portal de clientes

React + Vite + TypeScript, shadcn/ui + Tailwind, Supabase (auth, Postgres, Realtime, Edge Functions), Stripe, Resend. UI em PT-PT, moeda EUR.

## Estrutura

```
src/pages        Landing, Login, Dashboard (cliente), Admin
src/hooks        useSession, useProject (Realtime)
src/lib          supabase client, plans, stages
supabase/migrations/0001_init.sql
supabase/functions  create-checkout, customer-portal, stripe-webhook, notify-stage, _shared
spreadsheet/     business-model.xlsx
```

## 1. Variáveis de ambiente

Copie `.env.example` para `.env` (frontend, `VITE_*`) e defina os segredos das funções com `supabase secrets set`. Nunca faça commit de segredos.

| Variável | Onde | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | frontend | Supabase → Project Settings → API |
| `VITE_ADMIN_EMAIL` | frontend | O seu email (só mostra o botão Admin; a segurança real está no RLS e nas funções) |
| `VITE_STRIPE_PRICE_*` | frontend | IDs dos 4 preços (passo 3) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | funções | Stripe |
| `RESEND_API_KEY`, `EMAIL_FROM` | funções | Resend (domínio verificado) |
| `SITE_URL` | funções | URL do site (ex.: `https://o-seu-site.vercel.app`) |
| `ADMIN_EMAIL` | funções | O seu email |

## 2. Supabase

1. Crie um projeto em supabase.com.
2. Abra `supabase/migrations/0001_init.sql`, **substitua `ADMIN_EMAIL_HERE` pelo seu email** e execute no SQL Editor (ou `supabase db push`).
3. Authentication → URL Configuration: defina *Site URL* e adicione `<SITE_URL>/painel` aos *Redirect URLs*. O login por magic link (email) vem ativo por omissão.
4. Instale a CLI, faça `supabase link` e depois:

```bash
supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... RESEND_API_KEY=... \
  EMAIL_FROM="Nome <ola@o-seu-dominio.pt>" SITE_URL=https://... ADMIN_EMAIL=...
supabase functions deploy create-checkout customer-portal stripe-webhook notify-stage
```

## 3. Stripe

Em modo de teste primeiro. Crie 2 Products e 4 Prices recorrentes em EUR. **Em cada Price, adicione metadata `plan` = `estatico` ou `ecommerce`** (a função de checkout usa-o):

| Produto | Mensal | Anual |
|---|---|---|
| Website Estático (`plan=estatico`) | 17,00 € | 173,40 € |
| Website e-Commerce (`plan=ecommerce`) | 29,75 € | 303,45 € |

1. Copie os 4 IDs `price_...` para `VITE_STRIPE_PRICE_*`.
2. Coupons → crie `ESPECIAL15` (15% de desconto) e, nesse coupon, um Promotion Code com o código `ESPECIAL15`. O checkout permite códigos promocionais.
   - **Atenção:** os preços acima já incluem os 15%. Se o cliente usar `ESPECIAL15`, **acumula**, ficando mais 15% abaixo. É opcional: só se aplica se o cliente introduzir o código.
3. Settings → Billing → Customer portal: ative e permita cancelar, atualizar método de pagamento e ver faturas.
4. Developers → Webhooks → endpoint `https://<project-ref>.supabase.co/functions/v1/stripe-webhook` com os eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copie o *signing secret* para `STRIPE_WEBHOOK_SECRET`.

## 4. Resend

Verifique o seu domínio e crie uma API key. Emails enviados: pagamento confirmado, mudança de fase, projeto online. (O magic link é enviado pelo Supabase Auth; para usar o Resend nesse email, configure o SMTP em Supabase → Authentication → SMTP.)

## 5. Desenvolvimento e deploy (Vercel)

```bash
npm install
npm run dev
```

Deploy: importe o repositório na Vercel (preset Vite), adicione as variáveis `VITE_*` e faça deploy. O `vercel.json` trata das rotas do React Router. Atualize `SITE_URL` e os Redirect URLs do Supabase com o domínio final.

## Fluxo

1. Cliente subscreve na landing → Stripe Checkout → webhook cria o utilizador, o projeto (fase *Pagamento*) e envia o email de boas-vindas.
2. Cliente entra por magic link em `/entrar` com o mesmo email.
3. No `/admin` muda a fase, escreve uma nota e (opcional) o link de pré-visualização → o dashboard do cliente atualiza em direto e ele recebe email. Fase *Online* envia o email "projeto online".
