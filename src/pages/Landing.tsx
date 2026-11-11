import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { eur, PLANS, type Interval } from '@/lib/plans'
import { supabase } from '@/lib/supabase'

export default function Landing() {
  const [interval, setInterval] = useState<Interval>('month')
  const [busy, setBusy] = useState<string | null>(null)

  async function subscribe(priceId: string, key: string) {
    setBusy(key)
    const { data, error } = await supabase.functions.invoke('create-checkout', { body: { priceId } })
    if (error || !data?.url) {
      setBusy(null)
      toast.error('Não foi possível iniciar o pagamento.')
      return
    }
    window.location.href = data.url
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-10 flex items-center justify-between">
        <span className="font-semibold">Websites</span>
        <Link to="/entrar" className={buttonVariants({ variant: "outline", size: "sm" })}>Entrar</Link>
      </header>

      <section className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">O seu website, sem complicações</h1>
        <p className="mt-2 text-muted-foreground">Escolha um plano e acompanhe o seu projeto em tempo real.</p>
        <ToggleGroup
          className="mt-6 inline-flex"
          variant="outline"
          value={[interval]}
          onValueChange={(v) => v[0] && setInterval(v[0] as Interval)}
        >
          <ToggleGroupItem value="month">Mensal</ToggleGroupItem>
          <ToggleGroupItem value="year">Anual</ToggleGroupItem>
        </ToggleGroup>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <Card key={p.key}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
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
            <CardFooter>
              <Button className="w-full" disabled={busy !== null} onClick={() => subscribe(p.priceId[interval], p.key)}>
                {busy === p.key ? 'A abrir…' : 'Subscrever'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}
