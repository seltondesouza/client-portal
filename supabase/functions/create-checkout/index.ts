import { admin, cors, getUser, json } from '../_shared/common.ts'
import { stripe } from '../_shared/stripe.ts'

// Needs a signed-in account. The payment is tied to that account (client_reference_id).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const user = await getUser(req)
    if (!user?.email) return json({ error: 'unauthorized' }, 401)

    const { priceId } = await req.json()
    const price = await stripe.prices.retrieve(priceId)
    const plan = price.metadata.plan // 'estatico' | 'ecommerce', set in Stripe (see README)
    if (!price.active || !['estatico', 'ecommerce'].includes(plan)) return json({ error: 'invalid price' }, 400)

    // A free price (used for testing) is only allowed for the admin's own mailbox (a+tag@ counts as the same).
    const free = price.unit_amount === 0
    const base = (e: string) => e.toLowerCase().replace(/\+[^@]*@/, '@')
    if (free && base(user.email) !== base(Deno.env.get('ADMIN_EMAIL') ?? '')) return json({ error: 'invalid price' }, 400)

    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .maybeSingle()
    if (profile?.subscription_status && ['active', 'trialing', 'past_due'].includes(profile.subscription_status)) {
      return json({ error: 'already subscribed' }, 409)
    }

    const site = Deno.env.get('SITE_URL')!
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      adaptive_pricing: { enabled: false }, // always charge in EUR
      ...(free ? { payment_method_collection: 'if_required' as const } : {}), // free test price: no card needed
      client_reference_id: user.id,
      ...(profile?.stripe_customer_id ? { customer: profile.stripe_customer_id } : { customer_email: user.email }),
      subscription_data: { metadata: { plan } },
      metadata: { plan },
      success_url: `${site}/painel?pago=ok`,
      cancel_url: `${site}/painel`,
    })
    return json({ url: session.url })
  } catch (e) {
    console.error(e)
    return json({ error: 'checkout failed' }, 500)
  }
})
