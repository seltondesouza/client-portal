import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSession } from '@/hooks/useSession'
import { eur, PLANS, type Interval } from '@/lib/plans'
import { ADMIN_EMAIL, supabase } from '@/lib/supabase'

// Plan cards with the monthly/annual toggle. Used on the homepage and inside the dashboard.
// Subscribing needs an account: visitors are sent to create one first.
// a+tag@gmail.com counts as a@gmail.com (same inbox).
const base = (e: string) => e.toLowerCase().replace(/\+[^@]*@/, '@')
const TEST_PRICE = import.meta.env.VITE_STRIPE_PRICE_TEST as string | undefined

export function Plans() {
  const [interval, setInterval] = useState<Interval>('month')
  const [busy, setBusy] = useState<string | null>(null)
  const { session } = useSession()
  const navigate = useNavigate()
  const email = session?.user.email
  const showTest = !!TEST_PRICE && !!email && !!ADMIN_EMAIL && base(email) === base(ADMIN_EMAIL)

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

      {showTest && (
        <Card className="mt-8 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              Plano de teste (gratuito)
              <Badge variant="outline">Só visível para si</Badge>
            </CardTitle>
            <CardDescription>0,00 € /mês, sem cartão. Serve para testar o fluxo; será removido.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" disabled={busy !== null} onClick={() => subscribe(TEST_PRICE!, 'teste')}>
              {busy === 'teste' ? 'A abrir…' : 'Subscrever teste'}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <Card key={p.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                {p.name}
                <Badge>-15% desconto especial</Badge>
              </CardTitle>
              <CardDescription>{p.examples}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-muted-foreground line-through">{eur(p.normal[interval])}</span>
                <p className="text-3xl font-semibold">
                  {eur(p.price[interval])}
                  <span className="text-base font-normal text-muted-foreground">
                    {interval === 'month' ? ' /mês' : ' /ano'}
                  </span>
                </p>
              </div>
              <ul className="space-y-1 text-sm">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
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
