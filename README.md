# Portal de clientes — Selton de Souza

Os clientes subscrevem um plano de website (mensal ou anual), preenchem um briefing e acompanham o projeto num painel em tempo real. O administrador faz avançar o projeto passo a passo.

**Site:** https://client-portal-nine-beta.vercel.app

**Stack:** React + Vite + TypeScript, React Router, shadcn/ui + Tailwind (preto e branco), Supabase (auth, Postgres, Realtime, Edge Functions), Stripe (Checkout, Customer Portal, webhooks), Vercel. Interface em PT-PT, moeda EUR.

Antes de lançar, siga a [LAUNCH-CHECKLIST.md](LAUNCH-CHECKLIST.md).

## Como funciona

1. O visitante cria conta com email e palavra-passe e confirma o email.
2. No painel escolhe um plano e paga na página segura da Stripe.
3. O webhook cria o projeto (fase *Pagamento*) e liga-o à conta que pagou.
4. Aparece um briefing obrigatório (pop-up) com perguntas por passos.
5. O admin carrega em «Avançar para …» em cada cliente. O painel do cliente atualiza em direto.
6. No último passo o admin indica o endereço final do website; o cliente vê o botão «Abrir o meu website».
7. Opcional: o admin define um link de administração do site do cliente, que aparece no painel dele.

Fases: Pagamento → Briefing → Design → Desenvolvimento → Revisão → Online.

## Estrutura

```
src/pages        Landing, Login (entrar/criar conta/recuperar), Redefinir, Dashboard,
                 Briefing, Admin, Termos, Privacidade, NotFound
src/components   Plans, BriefingWizard, StageTimeline, HeroShapes, AppLayout, ui/ (shadcn)
src/hooks        useSession, useProject (Realtime)
src/lib          supabase, plans, stages, briefing (perguntas), url, site
supabase/migrations   0001 … 0005 (tabelas, RLS, briefings, URLs, idempotência do webhook)
supabase/functions    create-checkout, customer-portal, stripe-webhook, notify-stage, _shared
```

## Variáveis de ambiente

Copie `.env.example` para `.env` (frontend, `VITE_*`). Os segredos das funções definem-se no Supabase (Edge Functions → Secrets). **Nunca faça commit de segredos.**

| Variável | Onde | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | frontend | Supabase → Project Settings → API |
| `VITE_ADMIN_EMAIL` | frontend | Email do admin (só controla o que se vê; a segurança real está na base de dados e nas funções) |
| `VITE_STRIPE_PRICE_*` | frontend | IDs dos 4 preços (mensal/anual de cada plano) |
| `STRIPE_SECRET_KEY` | função | Chave **restrita** (`rk_live_…`) com Checkout Sessions, Customer portal, Subscriptions (escrita) e Prices, Customers (leitura) |
| `STRIPE_WEBHOOK_SECRET` | função | `whsec_…` do endpoint do webhook |
| `SITE_URL` | função | URL do site |
| `ADMIN_EMAIL` | função | Email do admin |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | função | Opcional: envio de emails sobre mudanças de fase. Sem estes valores, o cliente vê as atualizações apenas no painel. |

## Supabase

1. Crie o projeto e aplique, por ordem, os ficheiros de `supabase/migrations/`. **Em `0001_init.sql` substitua `ADMIN_EMAIL_HERE` pelo email do admin.**
2. Authentication → Providers → Email: «Confirm email» **ligado**.
3. Authentication → URL Configuration: *Site URL* = URL do site; *Redirect URLs* = `<URL do site>/**` (e `http://localhost:5173/**` para desenvolvimento).
4. Publique as funções: `create-checkout`, `customer-portal`, `notify-stage` (com verificação de JWT) e `stripe-webhook` (sem JWT: `supabase/config.toml`; é validada pela assinatura da Stripe).
5. Defina os segredos das funções (tabela acima).

**Aviso:** o envio de emails do Supabase por omissão tem um limite muito baixo (alguns por hora para todo o projeto). Antes de lançar, configure SMTP próprio em Project Settings → Authentication → SMTP (ex.: Gmail com palavra-passe de aplicação).

## Stripe

1. Crie 2 produtos e 4 preços recorrentes em EUR: Website Estático (17,00 €/mês, 173,40 €/ano) e Website e-Commerce (29,75 €/mês, 303,45 €/ano). **Cada preço leva metadata `plan` = `estatico` ou `ecommerce`.**
2. Coupon `ESPECIAL15` (15%, uma vez) com código promocional `ESPECIAL15`. Atenção: os preços já incluem 15% de desconto, por isso o código acumula.
3. Customer Portal ativo (cancelar, método de pagamento, faturas).
4. Webhook para `https://<projeto>.supabase.co/functions/v1/stripe-webhook` com os eventos `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
5. O webhook é idempotente: um projeto por sessão de pagamento, mesmo que a Stripe repita o evento.

## Desenvolvimento

Requer Node 20.19+ (ou 22+).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Deploy (Vercel)

O repositório está ligado à Vercel: cada push para `main` publica em produção. As variáveis `VITE_*` definem-se no projeto da Vercel. O `vercel.json` trata das rotas do React Router.

## Segurança em resumo

- RLS em todas as tabelas: os clientes só leem (e, no briefing, escrevem) os seus próprios dados; só o admin altera projetos.
- `create-checkout` exige sessão iniciada e liga o pagamento à conta.
- `notify-stage` verifica o admin no servidor e valida os endereços (preview, final e administração).
- O briefing e os links são sempre mostrados ao cliente como endereços absolutos validados.
