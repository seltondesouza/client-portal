# Get the 3 keys for `secrets.env`

Never paste a key into chat or commit it. Paste only into `supabase/secrets.env`, then into Supabase.

## 0. First, roll the leaked Stripe key
1. dashboard.stripe.com → Developers → API keys.
2. On the standard secret key (`sk_live_...51Uaf...`) click the three dots → Roll key.
3. Choose "Expire now", then confirm.

## 1. `STRIPE_SECRET_KEY` (a restricted key, `rk_live_...`)
1. Developers → API keys → Create restricted key (choose "Building your own integration" if asked).
2. Name: `client-portal`.
3. Set these, everything else stays None:
   - Checkout Sessions: Write
   - Customer portal: Write
   - Subscriptions: Write
   - Prices: Read
   - Customers: Read
4. Create key. Copy the `rk_live_...` value (shown once).
5. Paste it over `PASTE_NEW_rk_live_KEY_HERE` in `secrets.env`.

## 2. `STRIPE_WEBHOOK_SECRET` (`whsec_...`)
1. Developers → Webhooks → Add endpoint.
2. Endpoint URL: `https://mfyialaimorticobdnth.supabase.co/functions/v1/stripe-webhook`
3. Select events, tick exactly:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Add endpoint.
5. On the endpoint page: Signing secret → Reveal → copy `whsec_...`.
6. Paste it over `PASTE_whsec_VALUE_HERE`.

## 3. `RESEND_API_KEY` (`re_...`)
1. resend.com → sign up or log in.
2. API Keys → Create API Key, name `client-portal`, permission "Sending access".
3. Copy the `re_...` value (shown once).
4. Paste it over `PASTE_re_KEY_HERE`.
5. Without a verified domain Resend only sends to your own email. To email clients later: Domains → Add domain, add the DNS records it shows, then change `EMAIL_FROM` to an address on that domain.

## 4. Load the file into Supabase
1. supabase.com/dashboard → project `client-portal` → Edge Functions → Secrets.
2. "Add or replace secrets", paste the whole content of `secrets.env`, Save.
3. Delete `secrets.env` or keep it private. It is git-ignored.
