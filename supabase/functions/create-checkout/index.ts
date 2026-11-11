import { cors, json } from '../_shared/common.ts'
import { stripe } from '../_shared/stripe.ts'

// Public: anyone can start a checkout. Stripe collects the email.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { priceId } = await req.json()
    const price = await stripe.prices.retrieve(priceId)
    const plan = price.metadata.plan // 'estatico' | 'ecommerce', set in Stripe (see README)
    if (!price.active || !['estatico', 'ecommerce'].includes(plan)) return json({ error: 'invalid price' }, 400)

    const site = Deno.env.get('SITE_URL')!
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      adaptive_pricing: { enabled: false }, // always charge in EUR
      subscription_data: { metadata: { plan } },
      metadata: { plan },
      success_url: `${site}/entrar?pago=ok`,
      cancel_url: site,
    })
    return json({ url: session.url })
  } catch (e) {
    console.error(e)
    return json({ error: 'checkout failed' }, 500)
  }
})
