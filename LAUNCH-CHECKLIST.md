# Launch checklist

Live site: https://client-portal-nine-beta.vercel.app
Tags: **[you]** only you can do it, **[me]** I can do it when you say go.

## 1. Remove before launch (test leftovers)
- [ ] **[me]** Delete the Vercel variable `VITE_STRIPE_PRICE_TEST` (hides the "Plano de teste" card), then redeploy.
- [ ] **[me]** Archive the free price "TESTE e-Commerce gratis (remover)" in Stripe (`price_1Uagi03SJEPEFTEtIQM0pfuc`).
- [ ] **[you]** Cancel the test subscription in Stripe (customer `cus_VbwtaPhXUCVCBn`, subscription `sub_1Uaizb3SJEPEFTEtn90aw6jz`).
- [ ] **[me]** Delete the test client `seltondesouza0+teste1@gmail.com` and its project, updates and briefing from the database (after you finish testing).
- [ ] **[me]** Remove the free-price code path from `create-checkout` and the test card from `Plans.tsx` (optional, once the test is over).
- [ ] **[you]** Delete the local file `supabase/secrets.env` after loading the secrets (it is git-ignored, but keep no copies of keys).
- [ ] **[you]** Delete the unused Supabase secrets `RESEND_API_KEY` and `EMAIL_FROM` (Resend is not used).
- [ ] **[me]** Check no demo or placeholder text is left (search the site for "teste", "exemplo", "youtube").

## 2. Security
- [ ] **[you]** Confirm the leaked `sk_live_…51Uaf…` Stripe key was rolled (Stripe → Developers → API keys). The app must use a restricted `rk_live_` key.
- [ ] **[you]** Supabase → Authentication → Providers → Email: "Confirm email" must be **ON**.
- [ ] **[you]** Turn on 2-Step Verification for Gmail (admin email), GitHub, Vercel, Supabase and Stripe.
- [ ] **[you]** Supabase password rules: raise the minimum length and turn on leaked-password protection (Authentication → Providers → Email).
- [ ] **[me]** Re-run the Supabase security advisor and the RLS tests (anonymous read/write blocked) right before launch.
- [ ] **[me]** Confirm no secret is in the GitHub repo (only public values: Supabase URL, anon key, price IDs).
- [ ] Optional: authenticator-app code (MFA) for the admin account.

## 3. Email (the biggest launch risk)
Supabase's built-in sender allows only a few emails per hour for the **whole project**. Sign-up and password-reset emails will fail when several clients register at once (you already hit `429`).
- [ ] **[you]** Pick one: (a) Gmail app password (needs 2-Step Verification, then myaccount.google.com/apppasswords), or (b) your own domain + Resend.
- [ ] **[you]** Supabase → Project Settings → Authentication → SMTP: host `smtp.gmail.com`, port `465`, Gmail address, app password, sender "Selton de Souza".
- [ ] **[me]** After SMTP works: test sign-up and password reset, and optionally turn the stage emails back on (`GMAIL_USER`, `GMAIL_APP_PASSWORD` secrets).
- [ ] **[you]** Check the confirmation-email wording in Supabase → Authentication → Email Templates (translate to Portuguese).

## 4. Test end to end (use the free test plan, then once with a real 17,00 € card and refund it)
- [ ] Sign up with email + password, confirm the email, land on the dashboard.
- [ ] "Esqueci-me da palavra-passe" works and sets a new password.
- [ ] Wrong password shows the clear error.
- [ ] Subscribe: project appears on its own, "A confirmar o pagamento…" shows, no double subscription possible.
- [ ] Briefing popup opens, can't be closed, required fields block, answers save, "Enviar" closes it.
- [ ] Admin sees the briefing answers.
- [ ] Admin steps: Avançar through each stage; client sees the live update and the pop-up.
- [ ] "Voltar" goes back one step; "Enviar nota / link" works without changing the stage.
- [ ] Last step needs a valid website address; typos are rejected; client sees "Abrir o meu website".
- [ ] Optional admin link shows on the client's dashboard.
- [ ] "Gerir pagamento" opens the Stripe portal; cancelling works; the dashboard shows the cancelled status.
- [ ] Promo code `ESPECIAL15` applies 15% once on a real checkout.
- [ ] Phone check (real phone): homepage, sign-up, dashboard, briefing popup, admin.
- [ ] Another browser/incognito: logged-out visitors can't open `/painel`, `/briefing` or `/admin`; a client can't open `/admin`.

## 5. Stripe
- [ ] **[you]** Account fully activated (it is accepting payments).
- [ ] **[you]** Settings → Branding: name, logo, colours (checkout page looks like your site).
- [ ] **[you]** Settings → Billing → Invoices: business name, address and NIF on invoices; decide about IVA (prices currently have no tax added).
- [ ] **[you]** Settings → Customer emails: turn on receipts/successful-payment emails (Stripe sends them, so clients get a receipt even without our email).
- [ ] **[me]** Confirm the webhook endpoint stays enabled (it is now) and watch for failed deliveries in the first days.
- [ ] Decide: should `ESPECIAL15` stay public? Prices already include the 15% discount.

## 6. Content and legal
- [ ] **[you]** Have the Termos and Política de Privacidade reviewed (they are a draft). Add NIF, address and any refund policy.
- [ ] **[you]** Check your Gmail address as public contact is what you want (or use a business address).
- [ ] **[you]** Re-read all page wording (homepage, FAQ, briefing questions in `src/lib/briefing.ts`).
- [ ] Add a favicon/social preview image if you want links to look good when shared.

## 7. Technical
- [ ] **[me]** Refresh the README (live URL, current flow, secrets list, remove Resend).
- [ ] **[you]** Optional: your own domain (about 10–15 EUR/year) and then update Supabase Site URL and redirect URLs and the `SITE_URL` secret.
- [ ] **[you]** Supabase free plan limits: projects pause after inactivity. Consider upgrading before real clients.
- [ ] **[me]** Check Vercel and Supabase function logs for errors after the first real client.
- [ ] **[you]** Decide how you back up the database (Supabase free plan has no automatic backups).

## 8. Go live
- [ ] Everything above ticked.
- [ ] Do one last real test purchase and refund it.
- [ ] Share the link.
