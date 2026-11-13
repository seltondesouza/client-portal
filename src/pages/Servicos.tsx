import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, GlobeIcon, HelpCircleIcon, SearchIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useSession } from '@/hooks/useSession'
import { eurCents, SERVICES } from '@/lib/services'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Quote = { domain: string; available: boolean; priceCents: number | null }
type Mode = 'buy' | 'own' | 'unsure' | 'none'

const MODES: { id: Exclude<Mode, 'none'>; label: string; icon: typeof GlobeIcon }[] = [
  { id: 'buy', label: 'Quero comprar um', icon: SearchIcon },
  { id: 'own', label: 'Já tenho um', icon: GlobeIcon },
  { id: 'unsure', label: 'Não sei, ajudem-me', icon: HelpCircleIcon },
]

export default function Servicos() {
  const { session, loading } = useSession()
  const [hasProject, setHasProject] = useState<boolean | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [mode, setMode] = useState<Mode>('none')
  const [query, setQuery] = useState('')
  const [own, setOwn] = useState('')
  const [results, setResults] = useState<Quote[] | null>(null)
  const [chosen, setChosen] = useState<Quote | null>(null)
  const [searching, setSearching] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!session) return
    supabase.from('projects').select('id').eq('client_id', session.user.id).limit(1).then(({ data }) => setHasProject(!!data?.length))
  }, [session])

  if (loading || !session) return <p className="p-6 text-sm text-muted-foreground">A carregar…</p>

  const servicesTotal = SERVICES.filter((s) => picked.has(s.id)).reduce((n, s) => n + s.cents, 0)
  const domainTotal = mode === 'buy' && chosen ? (chosen.priceCents ?? 0) : 0
  const total = servicesTotal + domainTotal
  const domainReady = mode === 'none' || mode === 'unsure' || (mode === 'buy' && !!chosen) || (mode === 'own' && own.includes('.'))
  const canPay = hasProject && domainReady && (picked.size > 0 || mode !== 'none')

  function toggle(id: string) {
    setPicked((p) => {
      const n = new Set(p)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  async function search(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setChosen(null)
    const { data, error } = await supabase.functions.invoke('domain-search', { body: { query } })
    setSearching(false)
    if (error || !data?.results) {
      toast.error('Não foi possível pesquisar agora. Tente de novo ou escolha "Não sei, ajudem-me".')
      return
    }
    setResults(data.results)
  }

  async function pay() {
    setBusy(true)
    const { data, error } = await supabase.functions.invoke('create-addon-checkout', {
      body: {
        services: [...picked],
        domain: { mode, name: mode === 'buy' ? chosen?.domain : mode === 'own' ? own : undefined },
      },
    })
    setBusy(false)
    if (error) {
      const status = (error as { context?: Response }).context?.status
      toast.error(status === 409 ? 'Esse domínio já não está disponível. Escolha outro.' : 'Não foi possível continuar. Tente de novo.')
      return
    }
    if (data?.done) {
      toast.success('Guardado! Vamos tratar do seu domínio.')
      window.location.href = '/painel'
      return
    }
    if (data?.url) window.location.href = data.url
  }

  return (
    <AppLayout title="Serviços e domínio">
      {hasProject === false && (
        <Card>
          <CardHeader>
            <CardTitle>Primeiro, escolha um plano</CardTitle>
            <CardDescription>Os serviços extra juntam-se ao seu projeto. <Link to="/painel" className="underline">Ir para o painel</Link></CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>1. O seu domínio</CardTitle>
          <CardDescription>O endereço do seu website, por exemplo o-seu-negocio.pt. Preço de um ano, já com tudo incluído.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div role="group" aria-label="Domínio" className="grid gap-2 sm:grid-cols-3">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={mode === id}
                onClick={() => setMode(mode === id ? 'none' : id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border p-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground',
                  mode === id ? 'border-foreground bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <Icon className="size-4 shrink-0" /> {label}
              </button>
            ))}
          </div>

          {mode === 'buy' && (
            <div className="space-y-3">
              <form onSubmit={search} className="flex gap-2">
                <Input placeholder="o-seu-negocio ou o-seu-negocio.pt" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Nome do domínio" />
                <Button type="submit" disabled={searching}>{searching ? 'A pesquisar…' : 'Pesquisar'}</Button>
              </form>
              {results && results.length === 0 && <p className="text-sm text-muted-foreground">Sem resultados.</p>}
              <ul className="grid gap-2">
                {results?.map((r) => (
                  <li key={r.domain}>
                    <button
                      type="button"
                      disabled={!r.available}
                      onClick={() => setChosen(r)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground',
                        chosen?.domain === r.domain && 'border-foreground bg-muted',
                        !r.available && 'opacity-60',
                      )}
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {r.available ? <CheckIcon className="size-4 text-live-text" /> : <XIcon className="size-4 text-destructive" />}
                        {r.domain}
                      </span>
                      <span className="tabular-nums text-muted-foreground">{r.available && r.priceCents ? `${eurCents(r.priceCents)} /1.º ano` : 'Indisponível'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mode === 'own' && (
            <div className="space-y-2">
              <Input placeholder="o-seu-negocio.pt" value={own} onChange={(e) => setOwn(e.target.value)} aria-label="O seu domínio" />
              <p className="text-xs text-muted-foreground">Sem custo. Depois indicamos-lhe como o ligar ao website.</p>
            </div>
          )}

          {mode === 'unsure' && (
            <p className="text-sm text-muted-foreground">Sem problema. Sugerimos-lhe nomes disponíveis e só avançamos com o que escolher.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Serviços extra</CardTitle>
          <CardDescription>Pagamento único. Escolha só o que precisar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {SERVICES.map((s) => {
            const on = picked.has(s.id)
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.id)}
                className={cn(
                  'flex flex-col gap-1 rounded-lg border p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground',
                  on ? 'border-foreground bg-muted' : 'hover:bg-muted/50',
                )}
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  {s.name}
                  <span className="tabular-nums">{eurCents(s.cents)}</span>
                </span>
                <span className="text-xs text-muted-foreground">{s.text}</span>
              </button>
            )
          })}
        </CardContent>
      </Card>

      <div className="sticky bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-lift">
        <div>
          <p className="text-xs text-muted-foreground">Total (pagamento único)</p>
          <p className="text-2xl font-semibold tabular-nums">{eurCents(total)}</p>
        </div>
        <Button size="lg" className="h-11 px-6" disabled={!canPay || busy} onClick={pay}>
          {busy ? 'A abrir…' : total > 0 ? 'Pagar com Stripe' : 'Guardar escolha'}
        </Button>
      </div>
    </AppLayout>
  )
}
