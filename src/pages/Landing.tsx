import { Link } from 'react-router-dom'
import { ActivityIcon, ArrowRightIcon, BanIcon, ServerIcon, ShieldCheckIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { HeroShapes } from '@/components/HeroShapes'
import { Plans } from '@/components/Plans'
import { Reveal } from '@/components/Reveal'
import { useSession } from '@/hooks/useSession'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/site'

const TRUST = [
  { icon: ShieldCheckIcon, text: 'Pagamento seguro com Stripe' },
  { icon: BanIcon, text: 'Cancele quando quiser' },
  { icon: ActivityIcon, text: 'Acompanhe o projeto em tempo real' },
  { icon: ServerIcon, text: 'Alojamento e manutenção incluídos' },
]

const STEPS = [
  ['Pagamento', 'Subscreve um plano e a confirmação aparece no seu painel.'],
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
    'Depois de subscrever, entra no painel com o seu email e palavra-passe. Vê a fase atual, as notas sobre o projeto e a pré-visualização do design, tudo atualizado em tempo real.',
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{children}</p>
}

export default function Landing() {
  const { session } = useSession()
  return (
    <div>
      <div className="relative flex min-h-svh flex-col">
        <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-semibold">{SITE_NAME}</span>
          <Link to={session ? '/painel' : '/entrar'} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {session ? 'O meu painel' : 'Entrar'}
          </Link>
        </header>

        <section className="relative flex flex-1 items-center">
          <HeroShapes />
          <div className="relative mx-auto max-w-3xl px-4 pb-24 text-center">
            <h1 className="fade-up text-5xl font-semibold tracking-tight text-balance md:text-7xl">O seu website, sem complicações</h1>
            <p className="fade-up mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-balance" style={{ animationDelay: '0.15s' }}>
              Subscreva um plano mensal ou anual e acompanhe cada fase do projeto, do briefing até estar online.
            </p>
            <div className="fade-up mt-9" style={{ animationDelay: '0.3s' }}>
              <a href="#planos" className={buttonVariants({ size: 'lg' })}>
                Ver planos <ArrowRightIcon />
              </a>
            </div>
          </div>
          <a href="#planos" aria-label="Descer para os planos" className="nudge absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl text-muted-foreground">↓</a>
        </section>
      </div>

      <main>
        <section className="border-y bg-muted/40">
          <ul className="mx-auto grid max-w-5xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-8 md:grid-cols-4">
            {TRUST.map(({ icon: Icon, text }, i) => (
              <li key={text}>
                <Reveal delay={i * 80} className="flex flex-col items-center gap-3 text-center text-sm md:flex-row md:text-left">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-background">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-medium">{text}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section id="planos" className="mx-auto max-w-5xl scroll-mt-4 px-4 py-24">
          <Reveal>
            <Eyebrow>Planos</Eyebrow>
            <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight md:text-4xl">Escolha o seu plano</h2>
          </Reveal>
          <Reveal delay={100}>
            <Plans />
          </Reveal>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-24">
            <Reveal>
              <Eyebrow>Como funciona</Eyebrow>
              <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Sabe sempre em que fase está</h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
                Seis passos claros, do pagamento até o website estar online.
              </p>
            </Reveal>
            <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map(([title, text], i) => (
                <li key={title}>
                  <Reveal delay={(i % 3) * 90} className="h-full">
                    <div className="group h-full rounded-xl border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                      <span className="mb-4 flex size-9 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-transform duration-300 group-hover:scale-110">
                        {i + 1}
                      </span>
                      <p className="text-lg font-semibold">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-24">
          <Reveal>
            <Eyebrow>Perguntas</Eyebrow>
            <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Perguntas frequentes</h2>
          </Reveal>
          <Reveal delay={100}>
            <Accordion className="mt-8">
              {FAQ.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-base">{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>

        <section className="bg-foreground text-background">
          <Reveal className="mx-auto max-w-3xl px-4 py-20 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">Pronto para ter o seu website?</h2>
            <p className="mx-auto mt-3 max-w-md text-background/70">Escolha um plano e comece hoje. Cancele quando quiser.</p>
            <a href="#planos" className={buttonVariants({ variant: 'secondary', size: 'lg', className: 'mt-8' })}>
              Ver planos <ArrowRightIcon />
            </a>
          </Reveal>
        </section>
      </main>

      <footer className="bg-foreground text-background/70">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-background/15 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE_NAME}</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            <Link to="/termos" className="hover:text-background">Termos</Link>
            <Link to="/privacidade" className="hover:text-background">Privacidade</Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-background">Contacto</a>
            <Link to="/entrar" className="hover:text-background">Área de cliente</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
