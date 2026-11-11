import { Link } from 'react-router-dom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { HeroShapes } from '@/components/HeroShapes'
import { Plans } from '@/components/Plans'
import { useSession } from '@/hooks/useSession'

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
    'Depois de subscrever, entra no painel com o seu email e palavra-passe. Vê a fase atual, as notas sobre o projeto e a pré-visualização do design. Também recebe um email sempre que o projeto muda de fase.',
  ],
  [
    'Como crio a minha conta?',
    'Indique o seu email e uma palavra-passe e confirme o email que enviamos. Depois escolhe o plano e paga na página segura da Stripe.',
  ],
  [
    'Tenho um código promocional. Onde o uso?',
    'Pode introduzi-lo na página de pagamento, antes de confirmar.',
  ],
]

export default function Landing() {
  const { session } = useSession()
  return (
    <div className="min-h-svh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="font-semibold">Selton de Souza</span>
        <Link to={session ? '/painel' : '/entrar'} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          {session ? 'O meu painel' : 'Entrar'}
        </Link>
      </header>

      <main>
        <section className="relative">
          <HeroShapes />
          <div className="relative mx-auto max-w-3xl px-4 py-28 text-center md:py-28">
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">O seu website, sem complicações</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground text-balance">
              Subscreva um plano mensal ou anual e acompanhe cada fase do projeto, do briefing até estar online.
            </p>
            <a href="#planos" className={buttonVariants({ size: 'lg', className: 'mt-8' })}>Ver planos</a>
          </div>
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
          <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight">Escolha o seu plano</h2>
          <Plans />
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
          <span>Selton de Souza</span>
          <Link to="/entrar" className="underline">Área de cliente</Link>
        </div>
      </footer>
    </div>
  )
}
