// Server-side price list and domain quotes. The browser never decides a price: checkout recomputes everything here.

// One-time services, in cents (EUR). Keep in sync with src/lib/services.ts (display only).
export const SERVICES: Record<string, { name: string; cents: number }> = {
  redesign: { name: 'Redesign completo do website', cents: 14900 },
  paginas: { name: '3 páginas extra', cents: 5900 },
  logo: { name: 'Criação de logótipo', cents: 7900 },
  seo: { name: 'Otimização SEO (Google)', cents: 6900 },
  textos: { name: 'Escrita de textos profissionais', cents: 4900 },
  fotos: { name: 'Pack de imagens profissionais', cents: 3900 },
  email: { name: 'Email profissional com o seu domínio', cents: 3500 },
  reservas: { name: 'Sistema de reservas / marcações', cents: 9900 },
}

const num = (name: string, fallback: number) => {
  const v = Number(Deno.env.get(name))
  return Number.isFinite(v) && Deno.env.get(name) ? v : fallback
}

// Your margin. Customer pays: wholesale (in EUR) x (1 + MARGIN_PERCENT/100) + MARGIN_FIXED_EUR.
const MARGIN_PERCENT = () => num('MARGIN_PERCENT', 10)
const MARGIN_FIXED_EUR = () => num('MARGIN_FIXED_EUR', 1.37)
// Vercel prices domains in USD. Set USD_TO_EUR to keep the conversion current.
const USD_TO_EUR = () => num('USD_TO_EUR', 0.92)
// Optional: your yearly hosting cost per site, shown as its own line when > 0 (hosting is otherwise included in the subscription).
export const HOSTING_YEAR_EUR = () => num('HOSTING_YEAR_EUR', 0)

export const retail = (wholesaleEur: number) =>
  Math.round((wholesaleEur * (1 + MARGIN_PERCENT() / 100) + MARGIN_FIXED_EUR()) * 100)

const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/

export function cleanDomain(input: string): string | null {
  const v = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
  return DOMAIN_RE.test(v) ? v : null
}

export type DomainQuote = { domain: string; available: boolean; priceCents: number | null; wholesaleEur: number | null }

async function vercel(path: string) {
  const token = Deno.env.get('VERCEL_API_TOKEN')
  if (!token) throw new Error('VERCEL_API_TOKEN not set')
  const team = Deno.env.get('VERCEL_TEAM_ID')
  const url = `https://api.vercel.com${path}${team ? `${path.includes('?') ? '&' : '?'}teamId=${team}` : ''}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`vercel ${res.status}`)
  return res.json()
}

// Real availability and wholesale price from the Vercel Registrar API, then your margin on top.
export async function domainQuote(domain: string): Promise<DomainQuote> {
  const a = await vercel(`/v1/registrar/domains/${encodeURIComponent(domain)}/availability`)
  if (!a.available) return { domain, available: false, priceCents: null, wholesaleEur: null }
  const p = await vercel(`/v1/registrar/domains/${encodeURIComponent(domain)}/price`)
  const usd = Number(p.purchasePrice)
  if (!Number.isFinite(usd)) return { domain, available: false, priceCents: null, wholesaleEur: null }
  const wholesaleEur = usd * USD_TO_EUR()
  return { domain, available: true, wholesaleEur, priceCents: retail(wholesaleEur) }
}
