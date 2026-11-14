import { admin, cors, getUser, json } from '../_shared/common.ts'
import { cleanDomain, domainQuote, HOSTING_YEAR_EUR, MAX_PAGES, PAGE_CENTS, SERVICES } from '../_shared/pricing.ts'
import { stripe } from '../_shared/stripe.ts'

type Body = {
  services?: string[]
  pages?: number
  domain?: { mode: 'buy' | 'own' | 'unsure' | 'none'; name?: string }
}

// One-time payment for extra services and/or a domain. All prices are recomputed here.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const user = await getUser(req)
    if (!user?.email) return json({ error: 'unauthorized' }, 401)
    const body = (await req.json()) as Body

    const { data: project } = await admin
      .from('projects')
      .select('id')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!project) return json({ error: 'no project' }, 400)

    const ids = [...new Set(body.services ?? [])]
    if (ids.some((s) => !SERVICES[s])) return json({ error: 'invalid service' }, 400)

    const pages = Number.isInteger(body.pages) ? (body.pages as number) : 0
    if (pages < 0 || pages > MAX_PAGES) return json({ error: 'invalid pages' }, 400)

    const mode = body.domain?.mode ?? 'none'
    let domain: string | null = null
    // Quote-only services (cents 0) are recorded on the order but never charged.
    const lines: { name: string; cents: number; qty?: number }[] = ids.filter((s) => SERVICES[s].cents > 0).map((s) => ({ name: SERVICES[s].name, cents: SERVICES[s].cents }))
    if (pages > 0) lines.push({ name: 'Página extra', cents: PAGE_CENTS, qty: pages })
    const stored = [...ids, ...(pages > 0 ? [`paginas:${pages}`] : [])]

    if (mode === 'buy') {
      domain = cleanDomain(body.domain?.name ?? '')
      if (!domain) return json({ error: 'invalid domain' }, 400)
      const q = await domainQuote(domain)
      if (!q.available || q.priceCents === null) return json({ error: 'domain unavailable' }, 409)
      // Domain (1 year, wholesale + margin) and hosting for the same year are charged together, once.
      lines.push({ name: `Domínio ${domain} (1.º ano)`, cents: q.priceCents })
      const hosting = Math.round(HOSTING_YEAR_EUR() * 100)
      if (hosting > 0) lines.push({ name: 'Alojamento do domínio (1.º ano)', cents: hosting })
    } else if (mode === 'own') {
      domain = cleanDomain(body.domain?.name ?? '')
      if (!domain) return json({ error: 'invalid domain' }, 400)
    }

    const total = lines.reduce((n, l) => n + l.cents * (l.qty ?? 1), 0)
    const order = {
      client_id: user.id,
      project_id: project.id,
      services: stored,
      domain_mode: mode,
      domain,
      amount_cents: total,
    }

    // Nothing to charge (own domain / "I don't know"): just record the choice.
    if (total === 0) {
      if (mode === 'none' && stored.length === 0) return json({ error: 'nothing selected' }, 400)
      await admin.from('orders').insert({ ...order, status: 'paid' })
      await admin.from('project_updates').insert({
        project_id: project.id,
        stage: (await admin.from('projects').select('stage').eq('id', project.id).single()).data!.stage,
        note: stored.includes('email') ? 'Pedido de orçamento: email profissional. Vamos verificar a disponibilidade e enviar o preço.' : mode === 'unsure' ? 'O cliente precisa de ajuda a escolher o domínio.' : `Domínio próprio indicado: ${domain}.`,
      })
      return json({ done: true })
    }

    const { data: profile } = await admin.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle()
    const site = Deno.env.get('SITE_URL')!
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lines.map((l) => ({
        quantity: l.qty ?? 1,
        price_data: { currency: 'eur', unit_amount: l.cents, product_data: { name: l.name } },
      })),
      adaptive_pricing: { enabled: false },
      locale: 'pt',
      custom_text: {
        submit: { message: 'Pagamento único, sem renovação. Acompanha o pedido no seu painel.' },
      },
      client_reference_id: user.id,
      ...(profile?.stripe_customer_id ? { customer: profile.stripe_customer_id } : { customer_email: user.email }),
      metadata: {
        kind: 'addon',
        project_id: project.id,
        services: stored.join(','),
        domain_mode: mode,
        domain: domain ?? '',
        amount_cents: String(total),
      },
      success_url: `${site}/painel?extra=ok`,
      cancel_url: `${site}/servicos`,
    })
    return json({ url: session.url })
  } catch (e) {
    console.error(e)
    return json({ error: 'checkout failed' }, 500)
  }
})
