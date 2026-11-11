import { useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSession } from '@/hooks/useSession'
import { eur, PLANS, type Interval } from '@/lib/plans'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// Plan cards with the pill Mensal/Anual toggle. Used on the homepage and inside the dashboard.
// Subscribing needs an account: visitors are sent to create one first.
export function Plans() {
  const [interval, setInterval] = useState<Interval>('month')
  const [busy, setBusy] = useState<string | null>(null)
  const { session } = useSession()
  const navigate = useNavigate()

  async function subscribe(priceId: string, key: string) {
    if (!session) {
      navigate('/entrar?modo=criar')
      return
    }
    setBusy(key)
    const { data, error } = await supabase.functions.invoke('create-checkout', { body: { priceId } })
    if (error || !data?.url) {
      setBusy(null)
      const already = (error as { context?: Response } | null)?.context?.status === 409
      toast.error(already ? 'Já tem uma subscrição ativa. Use "Gerir pagamento" no painel.' : 'Não foi possível iniciar o pagamento.')
      return
    }
    window.location.href = data.url
  }

  return (
    <div>
      <div className="flex justify-center">
        <div role="group" aria-label="Periodicidade" className="inline-flex rounded-full bg-muted p-[3px]">
          {(['month', 'year'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={interval === v}
              onClick={() => setInterval(v)}
              className={cn(
                'inline-flex h-9 items-center gap-2 rounded-full px-[18px] text-sm font-medium text-muted-foreground outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                interval === v && 'bg-card text-foreground shadow-[0_1px_2px_rgb(10_10_10/0.12)]',
              )}
            >
              {v === 'month' ? 'Mensal' : 'Anual'}
              {v === 'year' && <Badge variant="live" className="h-[18px] px-1.5 text-[11px]">-15%</Badge>}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-5 md:grid-cols-2">
        {PLANS.map((p) => {
          const featured = p.key === 'ecommerce'
          return (
            <article
              key={p.key}
              className={cn(
                'flex h-full flex-col gap-6 rounded-xl border bg-card p-7 transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-lift',
                featured && 'border-[1.5px] border-foreground',
              )}
            >
              <div>
                <Badge variant={featured ? 'live' : 'default'}>{featured ? 'Mais escolhido' : '-15% desconto especial'}</Badge>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.examples}</p>
              </div>
              <div>
                <span className="text-sm tabular-nums text-muted-foreground line-through">{eur(p.normal[interval])}</span>
                <p className="text-4xl font-semibold tracking-tight tabular-nums">
                  {eur(p.price[interval])}
                  <span className="text-[15px] font-normal tracking-normal text-muted-foreground">{interval === 'month' ? ' /mês' : ' /ano'}</span>
                </p>
                <p className="mt-1 min-h-5 text-[13px] tabular-nums text-muted-foreground">
                  {interval === 'year' ? `Equivale a ${eur(p.price.year / 12)} /mês` : 'Pago mensalmente'}
                </p>
              </div>
              <ul className="grid gap-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-live-text" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto grid gap-2 text-center">
                <Button
                  variant={featured ? 'default' : 'outline'}
                  className="h-11 w-full text-[15px]"
                  disabled={busy !== null}
                  onClick={() => subscribe(p.priceId[interval], p.key)}
                >
                  {busy === p.key ? 'A abrir…' : 'Subscrever'}
                </Button>
                <p className="text-xs text-muted-foreground">Pagamento seguro com Stripe. Cancele quando quiser.</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
