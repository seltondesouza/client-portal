import { cors, getUser, json } from '../_shared/common.ts'
import { cleanDomain, domainQuote } from '../_shared/pricing.ts'

const TLDS = ['pt', 'com', 'eu', 'net']

// Signed-in clients only. "cafe-aurora" checks several extensions; "cafe-aurora.pt" checks that one.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const user = await getUser(req)
    if (!user) return json({ error: 'unauthorized' }, 401)
    const { query } = await req.json()
    const raw = String(query ?? '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
    if (!raw || raw.length > 80) return json({ error: 'invalid query' }, 400)
    const names = raw.includes('.') ? [raw] : TLDS.map((t) => `${raw.replace(/[^a-z0-9-]/g, '')}.${t}`)
    const valid = names.map(cleanDomain).filter((d): d is string => !!d)
    if (!valid.length) return json({ error: 'invalid query' }, 400)
    const results = await Promise.all(valid.map((d) => domainQuote(d).catch(() => null)))
    return json({ results: results.filter((r) => r !== null) })
  } catch (e) {
    console.error(e)
    return json({ error: 'search failed' }, 500)
  }
})
