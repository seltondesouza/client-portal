// Display copy of the one-time service list. The real prices live in supabase/functions/_shared/pricing.ts
// and are recomputed on the server at checkout, so changing a number here never changes what is charged.
export const SERVICES = [
  { id: 'redesign', name: 'Redesign completo', text: 'Novo visual para o seu website atual.', cents: 14900 },
  { id: 'paginas', name: '3 páginas extra', text: 'Mais espaço para serviços, equipa ou blog.', cents: 5900 },
  { id: 'logo', name: 'Logótipo', text: 'Uma marca limpa, pronta a usar em tudo.', cents: 7900 },
  { id: 'seo', name: 'SEO (Google)', text: 'Para os clientes o encontrarem mais depressa.', cents: 6900 },
  { id: 'textos', name: 'Textos profissionais', text: 'Escritos por nós, claros e persuasivos.', cents: 4900 },
  { id: 'fotos', name: 'Pack de imagens', text: 'Fotografias profissionais para o site.', cents: 3900 },
  { id: 'email', name: 'Email com o seu domínio', text: 'geral@oseunegocio.pt em vez de Gmail.', cents: 3500 },
  { id: 'reservas', name: 'Reservas e marcações', text: 'Os clientes marcam online, 24 horas por dia.', cents: 9900 },
] as const

export const eurCents = (c: number) =>
  new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(c / 100)

export const serviceName = (id: string) => SERVICES.find((s) => s.id === id)?.name ?? id

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
