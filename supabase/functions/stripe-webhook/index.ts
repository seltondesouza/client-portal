import Stripe from 'npm:stripe@17'
import { admin } from '../_shared/common.ts'
import { stripe } from '../_shared/stripe.ts'
import { sendEmail, templates } from '../_shared/email.ts'

const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

async function findOrCreateUser(email: string) {
  const { data: existing } = await admin.from('profiles').select('id').eq('email', email).maybeSingle()
  if (existing) return existing.id as string
  const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true })
  if (error) throw error
  return data.user.id // the DB trigger creates the profile
}

async function syncSubscription(sub: Stripe.Subscription) {
  const end = sub.items.data[0]?.current_period_end
  await admin
    .from('profiles')
    .update({
      subscription_status: sub.status,
      current_period_end: end ? new Date(end * 1000).toISOString() : null,
    })
    .eq('stripe_customer_id', sub.customer as string)
}

Deno.serve(async (req) => {
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      req.headers.get('stripe-signature')!,
      secret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch {
    return new Response('bad signature', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object as Stripe.Checkout.Session
      const email = s.customer_details?.email?.toLowerCase()
      if (s.mode === 'subscription' && email) {
        const userId = await findOrCreateUser(email)
        await admin.from('profiles').update({ stripe_customer_id: s.customer as string }).eq('id', userId)
        const { data: project } = await admin
          .from('projects')
          .insert({ client_id: userId, plan: s.metadata?.plan, stage: 'pagamento' })
          .select('id')
          .single()
        if (project) {
          await admin.from('project_updates').insert({ project_id: project.id, stage: 'pagamento', note: 'Pagamento confirmado.' })
        }
        await syncSubscription(await stripe.subscriptions.retrieve(s.subscription as string))
        await sendEmail(email, templates.welcome())
      }
    } else if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      await syncSubscription(event.data.object as Stripe.Subscription)
    }
  } catch (e) {
    console.error(e)
    return new Response('handler error', { status: 500 }) // Stripe retries
  }
  return new Response('ok')
})
