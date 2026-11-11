import { useState } from 'react'
import { CheckIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSession } from '@/hooks/useSession'
import { eur, PLANS, type Interval } from '@/lib/plans'
import { supabase } from '@/lib/supabase'

// Plan cards with the monthly/annual toggle. Used on the homepage and inside the dashboard.
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
        <ToggleGroup variant="outline" value={[interval]} onValueChange={(v) => v[0] && setInterval(v[0] as Interval)}>
          <ToggleGroupItem value="month">Mensal</ToggleGroupItem>
          <ToggleGroupItem value="year">Anual</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <Card key={p.key} className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                {p.name}
                <Badge>-15% desconto especial</Badge>
              </CardTitle>
              <CardDescription>{p.examples}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-5">
              <div>
                <span className="text-muted-foreground line-through">{eur(p.normal[interval])}</span>
                <p className="text-4xl font-semibold tracking-tight">
                  {eur(p.price[interval])}
                  <span className="text-base font-normal text-muted-foreground">
                    {interval === 'month' ? ' /mês' : ' /ano'}
                  </span>
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" disabled={busy !== null} onClick={() => subscribe(p.priceId[interval], p.key)}>
                {busy === p.key ? 'A abrir…' : 'Subscrever'}
              </Button>
              <p className="text-xs text-muted-foreground">Pagamento seguro com Stripe. Cancele quando quiser.</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
