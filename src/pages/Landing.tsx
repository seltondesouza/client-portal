import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { eur, PLANS, type Interval } from '@/lib/plans'
import { supabase } from '@/lib/supabase'

const TRUST = [
  'Pagamento seguro com Stripe',
  'Cancele quando quiser',
  'Acompanhe o projeto em tempo real',
  'Alojamento e manutenção incluídos',
]

const STEPS = [
  ['Pagamento', 'Subscreve um plano e recebe a confirmação por email.'],
  ['Briefing', 'Percebemos o que precisa para o seu website.'],
  ['Design', 'Vê uma pré-visualização do design.'],
  ['Desenvolvimento', 'O website é construído.'],
  ['Revisão', 'Revê tudo antes de ir para o ar.'],
  ['Online', 'O website fica publicado.'],
]

const FAQ = [
  [
    'Como é feito o pagamento?',
    'O pagamento é processado pela Stripe, numa página segura. Os dados do seu cartão nunca passam por nós.',
  ],
  [
    'Posso cancelar?',
    'Sim. No seu painel, em "Gerir pagamento", pode cancelar a subscrição ou atualizar o método de pagamento. A subscrição termina no fim do período já pago.',
  ],
  [
    'Vou receber fatura?',
    'Pode consultar o histórico de pagamentos e faturas em "Gerir pagamento", no seu painel.',
  ],
  [
    'Como acompanho o meu projeto?',
    'Depois de subscrever, entra no painel com o seu email. Vê a fase atual, as notas sobre o projeto e a pré-visualização do design. Também recebe um email sempre que o projeto muda de fase.',
  ],
  [
    'Preciso de palavra-passe?',
    'Não. Entra com um link enviado para o seu email.',
  ],
  [
    'Tenho um código promocional. Onde o uso?',
    'Pode introduzi-lo na página de pagamento, antes de confirmar.',
  ],
]

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
    <div className="min-h-svh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="font-semibold">Websites</span>
        <Link to="/entrar" className={buttonVariants({ variant: 'outline', size: 'sm' })}>Entrar</Link>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-4 pt-12 pb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-balance">O seu website, sem complicações</h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-balance">
            Subscreva um plano mensal ou anual e acompanhe cada fase do projeto, do briefing até estar online.
          </p>
          <a href="#planos" className={buttonVariants({ size: 'lg', className: 'mt-6' })}>Ver planos</a>
        </section>

        <section className="border-y bg-muted/40">
          <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-4 gap-y-3 px-4 py-5 text-sm md:grid-cols-4">
            {TRUST.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span aria-hidden>✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="planos" className="mx-auto max-w-4xl scroll-mt-4 px-4 py-14">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Escolha o seu plano</h2>
          <div className="mt-5 flex justify-center">
            <ToggleGroup
              variant="outline"
              value={[interval]}
              onValueChange={(v) => v[0] && setInterval(v[0] as Interval)}
            >
              <ToggleGroupItem value="month">Mensal</ToggleGroupItem>
              <ToggleGroupItem value="year">Anual</ToggleGroupItem>
            </ToggleGroup>
          </div>

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
        </section>

        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-4xl px-4 py-14">
            <h2 className="text-center text-2xl font-semibold tracking-tight">Como funciona</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Sabe sempre em que fase está o seu projeto.
            </p>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="flex gap-3 rounded-lg border bg-background p-4">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-sm text-background">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-14">
          <h2 className="text-center text-2xl font-semibold tracking-tight">Perguntas frequentes</h2>
          <Accordion className="mt-6">
            {FAQ.map(([q, a]) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>Websites</span>
          <Link to="/entrar" className="underline">Área de cliente</Link>
        </div>
      </footer>
    </div>
  )
}
