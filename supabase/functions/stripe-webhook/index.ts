import Stripe from 'npm:stripe@17'
import { admin } from '../_shared/common.ts'
import { stripe } from '../_shared/stripe.ts'
import { notifyAdmin, sendEmail, templates } from '../_shared/email.ts'

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
      if (s.mode === 'payment' && s.metadata?.kind === 'addon' && s.payment_status === 'paid' && s.client_reference_id) {
        const m = s.metadata
        // Idempotent: one order per Checkout Session.
        const { data: order } = await admin
          .from('orders')
          .upsert(
            {
              client_id: s.client_reference_id,
              project_id: m.project_id,
              stripe_session_id: s.id,
              services: m.services ? m.services.split(',') : [],
              domain_mode: m.domain_mode || 'none',
              domain: m.domain || null,
              amount_cents: s.amount_total ?? Number(m.amount_cents),
            },
            { onConflict: 'stripe_session_id', ignoreDuplicates: true },
          )
          .select('id')
          .maybeSingle()
        if (order) {
          const { data: p } = await admin.from('projects').select('stage').eq('id', m.project_id).single()
          if (p) await admin.from('project_updates').insert({ project_id: m.project_id, stage: p.stage, note: 'Pedido de serviços extra recebido. Vamos tratar disto.' })
          const names = [...(m.services ? m.services.split(',') : []), ...(m.domain_mode === 'buy' ? [`Domínio ${m.domain}`] : [])].join(', ')
          const total = s.amount_total ?? Number(m.amount_cents)
          if (email) await sendEmail(email, templates.orderPaid(names || 'Serviços extra', total)) // only on first delivery
          await notifyAdmin('Novo pedido', `${email ?? 'Um cliente'} pagou ${(total / 100).toFixed(2)} €: ${names}.`)
        }
      } else if (s.mode === 'subscription' && email) {
        const userId = s.client_reference_id ?? (await findOrCreateUser(email)) // the account that paid
        await admin.from('profiles').update({ stripe_customer_id: s.customer as string }).eq('id', userId)
        // Idempotent: one project per Checkout Session. A retried event finds the row and skips the side effects.
        const { data: project } = await admin
          .from('projects')
          .upsert(
            { client_id: userId, plan: s.metadata?.plan, stage: 'pagamento', stripe_session_id: s.id },
            { onConflict: 'stripe_session_id', ignoreDuplicates: true },
          )
          .select('id')
          .maybeSingle()
        if (project) {
          await admin.from('project_updates').insert({ project_id: project.id, stage: 'pagamento', note: 'Pagamento confirmado.' })
        }
        await syncSubscription(await stripe.subscriptions.retrieve(s.subscription as string))
        if (project) {
          await sendEmail(email, templates.welcome()) // only on first delivery
          await notifyAdmin('Nova subscrição', `${email} subscreveu o plano ${s.metadata?.plan}.`)
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      await syncSubscription(event.data.object as Stripe.Subscription)
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      await syncSubscription(sub)
      const { data: p } = await admin.from('profiles').select('email').eq('stripe_customer_id', sub.customer as string).maybeSingle()
      if (p?.email) await sendEmail(p.email, templates.canceled())
      await notifyAdmin('Subscrição cancelada', `${p?.email ?? 'Um cliente'} cancelou a subscrição.`)
    } else if (event.type === 'invoice.payment_failed') {
      const inv = event.data.object as Stripe.Invoice
      const to = inv.customer_email
      // Stripe retries a failing invoice several times: email only on the first attempt.
      if (to && inv.attempt_count === 1) await sendEmail(to, templates.paymentFailed())
      await notifyAdmin('Pagamento falhado', `${to ?? 'Um cliente'}: cobrança de ${((inv.amount_due ?? 0) / 100).toFixed(2)} € falhou (tentativa ${inv.attempt_count}).`)
    } else if (event.type === 'charge.refunded') {
      const ch = event.data.object as Stripe.Charge
      const to = ch.billing_details?.email ?? ch.receipt_email
      if (to) await sendEmail(to, templates.refund(ch.amount_refunded))
      await notifyAdmin('Reembolso', `${to ?? 'Um cliente'} foi reembolsado em ${(ch.amount_refunded / 100).toFixed(2)} €.`)
    }
  } catch (e) {
    console.error(e)
    return new Response('handler error', { status: 500 }) // Stripe retries
  }
  return new Response('ok')
})
