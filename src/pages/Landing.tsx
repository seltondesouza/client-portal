import { Link } from 'react-router-dom'
import { ActivityIcon, ArrowDownIcon, ArrowRightIcon, BanIcon, ServerIcon, ShieldCheckIcon } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { buttonVariants } from '@/components/ui/button'
import { HeroShapes } from '@/components/HeroShapes'
import { LiveIndicator } from '@/components/LiveIndicator'
import { Plans } from '@/components/Plans'
import { Reveal } from '@/components/Reveal'
import { StageTimeline } from '@/components/StageTimeline'
import { BuildAnimation, DomainTyper, ServiceIcon } from '@/components/Motion'
import { Reviews } from '@/components/Reviews'
import { useCycle } from '@/hooks/useCycle'
import { useSession } from '@/hooks/useSession'
import { STAGES } from '@/lib/stages'
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

const HERO_NOTES = [
  'Pagamento confirmado.',
  'Recebemos o seu briefing.',
  'Enviámos a primeira proposta de design.',
  'Página de contactos concluída.',
  'Reveja tudo antes de publicarmos.',
  'O seu website está online!',
]

// Example project that advances on its own, so visitors see the product before they buy.
function HeroExample() {
  const i = useCycle(STAGES.length, 3200, 2)
  const stage = STAGES[i].key
  return (
    <div className="fade-up relative mx-auto w-full max-w-md rounded-xl border bg-card p-6 text-left shadow-lift" style={{ animationDelay: '0.45s' }} aria-label="Exemplo de projeto a avançar">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Café Aurora · Website Estático</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{i === 5 ? 'O seu website está online' : `Fase ${i + 1} de ${STAGES.length}: ${STAGES[i].label}`}</p>
        </div>
        <LiveIndicator status="live" />
      </div>
      <div className="mt-5"><StageTimeline stage={stage} /></div>
      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">{HERO_NOTES[i]}</p>
    </div>
  )
}

// Six numbered steps along a line with a dot travelling over it. Deliberately not another phase tracker:
// the hero already shows that one.
function HowItWorks() {
  return (
    <>
      <div className="relative mx-auto mt-12 hidden h-3 max-w-4xl lg:block" aria-hidden>
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="travel-dot absolute top-0 size-3 rounded-full bg-live ring-4 ring-live/30" />
      </div>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(([title, text], n) => (
          <li key={title}>
            <Reveal delay={(n % 3) * 90} className="h-full">
              <div className="h-full rounded-xl border bg-background p-6">
                <span className="mb-4 flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">{n + 1}</span>
                <p className="text-[17px] font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </>
  )
}

const EXTRAS = [
  { kind: 'domain', title: 'O seu domínio', text: 'Escolha o endereço ou deixe-nos ajudar. Preço real, sem surpresas.' },
  { kind: 'redesign', title: 'Redesign', text: 'Um site antigo com cara nova, mantendo o que funciona.' },
  { kind: 'seo', title: 'SEO', text: 'Para ser encontrado no Google por quem procura o que vende.' },
  { kind: 'logo', title: 'Logótipo', text: 'Uma marca simples e memorável para tudo o que fizer.' },
] as const

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
          <HeroShapes className="opacity-20" />
          <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 px-4 pb-24 pt-8 md:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center md:text-left">
              <h1 className="fade-up text-5xl font-semibold tracking-[-0.035em] text-balance md:text-7xl md:leading-none">O seu website, sem complicações</h1>
              <p className="fade-up mt-5 max-w-xl text-lg text-muted-foreground text-balance max-md:mx-auto" style={{ animationDelay: '0.15s' }}>
                Subscreva um plano mensal ou anual e acompanhe cada fase do projeto, em direto, do briefing até estar online.
              </p>
              <div className="fade-up mt-9" style={{ animationDelay: '0.3s' }}>
                <a href="#planos" className={buttonVariants({ size: 'lg', className: 'h-12 px-5 text-[15px]' })}>
                  Ver planos <ArrowRightIcon />
                </a>
              </div>
            </div>
            <HeroExample />
          </div>
          <a href="#planos" aria-label="Descer para os planos" className="nudge absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground">
            <ArrowDownIcon className="size-6" />
          </a>
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
            <HowItWorks />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <Eyebrow>Do rascunho ao online</Eyebrow>
              <h2 className="text-center text-3xl font-semibold tracking-tight text-balance md:text-left md:text-4xl">Construído à sua frente</h2>
              <p className="mt-3 text-center text-muted-foreground md:text-left">
                Cada bloco é pensado para o seu negócio. Vê o resultado a crescer no painel, sem enviar emails nem esperar semanas.
              </p>
            </Reveal>
            <Reveal delay={120}><BuildAnimation /></Reveal>
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto max-w-5xl px-4 py-24">
            <Reveal>
              <Eyebrow>Domínio e extras</Eyebrow>
              <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">Mais do que um website</h2>
              <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
                Depois de subscrever, acrescente no seu painel o que precisar. Pagamento único, pela Stripe.
              </p>
            </Reveal>
            <Reveal delay={80} className="mt-8"><DomainTyper /></Reveal>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {EXTRAS.map((x, i) => (
                <li key={x.title}>
                  <Reveal delay={i * 90} className="h-full">
                    <div className="flex h-full flex-col items-start gap-3 rounded-xl border bg-card p-6">
                      <ServiceIcon kind={x.kind} />
                      <p className="text-[17px] font-semibold">{x.title}</p>
                      <p className="text-sm text-muted-foreground">{x.text}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Reviews />

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
            <a href="#planos" className={buttonVariants({ variant: 'live', size: 'lg', className: 'mt-8 h-12 px-5 text-[15px]' })}>
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
