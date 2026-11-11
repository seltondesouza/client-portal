import { admin, cors, getUser, json } from '../_shared/common.ts'
import { stripe } from '../_shared/stripe.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const user = await getUser(req)
  if (!user) return json({ error: 'unauthorized' }, 401)

  const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).single()
  if (!profile?.stripe_customer_id) return json({ error: 'no customer' }, 404)

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${Deno.env.get('SITE_URL')}/painel`,
  })
  return json({ url: session.url })
})
