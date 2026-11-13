// Display copy of the one-time service list. The real prices live in supabase/functions/_shared/pricing.ts
// and are recomputed on the server at checkout, so changing a number here never changes what is charged.
export const SERVICES = [
  { id: 'redesign', name: 'Redesign completo', text: 'Novo visual para o seu website atual.', cents: 990 },
  { id: 'logo', name: 'Logótipo', text: 'Uma marca limpa, pronta a usar em tudo.', cents: 790 },
  { id: 'seo', name: 'SEO (Google)', text: 'Para os clientes o encontrarem mais depressa.', cents: 690 },
  { id: 'reservas', name: 'Reservas e marcações', text: 'Os clientes marcam online, 24 horas por dia.', cents: 990 },
  { id: 'email', name: 'Email com o seu domínio', text: 'geral@oseunegocio.pt. O preço depende do domínio: verificamos e enviamos-lhe o orçamento.', cents: 0, quote: true },
] as const

// Extra pages are priced per page. Keep in sync with PAGE_CENTS on the server.
export const PAGE_CENTS = 200
export const MAX_PAGES = 20

export const eurCents = (c: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(c / 100)

export const serviceName = (id: string) => {
  if (id.startsWith('paginas:')) return `${id.split(':')[1]} página(s) extra`
  return SERVICES.find((s) => s.id === id)?.name ?? id
}

export type Order = {
  id: string
  client_id: string
  project_id: string | null
  services: string[]
  domain_mode: 'none' | 'buy' | 'own' | 'unsure'
  domain: string | null
  amount_cents: number
  status: 'paid' | 'done'
  created_at: string
}

export type Review = {
  id: string
  client_id: string
  author_name: string
  rating: number
  body: string
  approved: boolean
  created_at: string
}

export const orderSummary = (o: Pick<Order, 'services' | 'domain_mode' | 'domain'>) => {
  const parts = o.services.map(serviceName)
  if (o.domain_mode === 'buy') parts.push(`Domínio ${o.domain}`)
  if (o.domain_mode === 'own') parts.push(`Domínio próprio ${o.domain}`)
  if (o.domain_mode === 'unsure') parts.push('Ajuda a escolher o domínio')
  return parts.join(' · ')
}
