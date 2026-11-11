# Launch checklist

Live site: https://client-portal-nine-beta.vercel.app
Tags: **[you]** only you can do it, **[me]** I can do it when you say go.

## Verified so far
- Function logs: since your Stripe account was activated, checkout, the webhook, the customer portal and every stage change returned 200, with no errors.
- Note: someone/something added the webhook idempotency change (migration `0005_project_checkout_session.sql`) during the session; repo, database and deployed function are in sync.

## 1. Remove before launch (test leftovers)
- [x] The "Plano de teste" card and its code are removed. **[you]** Delete the now-unused Vercel variable `VITE_STRIPE_PRICE_TEST` in the Vercel dashboard (Settings → Environment Variables); it no longer does anything.
- [x] The free test price is archived in Stripe.
- [x] The test subscription is cancelled (it never charged anything). Optional: delete the test customer `cus_VbwtaPhXUCVCBn` in Stripe.
- [x] The test client and its project, updates and briefing are deleted. Only the admin account remains.
- [x] The free-price code path and the test card are removed (function redeployed).
- [ ] **[you]** Delete the local file `supabase/secrets.env` after loading the secrets (it is git-ignored, but keep no copies of keys).
- [ ] **[you]** Delete the unused Supabase secrets `RESEND_API_KEY` and `EMAIL_FROM` (Resend is not used).
- [x] **[me]** Check no demo or placeholder text is left (done: only the "Exemplo:" input hints remain).

## 2. Security
- [ ] **[you]** Confirm the full-access Stripe secret key that was pasted in chat earlier was rolled (Stripe → Developers → API keys). The app must use a restricted `rk_live_` key.
- [ ] **[you]** Supabase → Authentication → Providers → Email: "Confirm email" must be **ON**.
- [ ] **[you]** Turn on 2-Step Verification for Gmail (admin email), GitHub, Vercel, Supabase and Stripe.
- [ ] **[you]** Supabase password rules: raise the minimum length and turn on leaked-password protection (Authentication → Providers → Email). The security advisor still flags it; it may need a paid Supabase plan.
- [x] **[me]** Re-run the Supabase security advisor and the RLS tests (done: anonymous read, update and delete blocked; all four functions refuse the wrong caller). **Re-run once more right before launch.**
- [x] **[me]** Confirm no secret is in the GitHub repo (done: none in tracked files or history; `.env` and `secrets.env` are git-ignored).
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
- [x] The webhook endpoint is enabled and delivered successfully during testing (and it is idempotent: Stripe retries cannot create duplicate projects).
- [ ] **[me]** Watch for failed webhook deliveries in the first days after launch.
- [ ] Decide: should `ESPECIAL15` stay public? Prices already include the 15% discount.

## 6. Content and legal
- [ ] **[you]** Have the Termos and Política de Privacidade reviewed (they are a draft). Add NIF, address and any refund policy.
- [ ] **[you]** Check your Gmail address as public contact is what you want (or use a business address).
- [ ] **[you]** Re-read all page wording (homepage, FAQ, briefing questions in `src/lib/briefing.ts`).
- [ ] Add a favicon/social preview image if you want links to look good when shared.

## 7. Technical
- [x] **[me]** Refresh the README (done).
- [ ] **[you]** Optional: your own domain (about 10–15 EUR/year) and then update Supabase Site URL and redirect URLs and the `SITE_URL` secret.
- [ ] **[you]** Supabase free plan limits: projects pause after inactivity. Consider upgrading before real clients.
- [ ] **[me]** Check Vercel and Supabase function logs for errors after the first real client.
- [ ] **[you]** Decide how you back up the database (Supabase free plan has no automatic backups).

## 8. Go live
- [ ] Everything above ticked.
- [ ] Do one last real test purchase and refund it.
- [ ] Share the link.
