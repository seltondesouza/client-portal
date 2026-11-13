import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BriefingWizard } from '@/components/BriefingWizard'
import { ExtrasPanel } from '@/components/ExtrasPanel'
import { ReviewCard } from '@/components/ReviewCard'
import { Stat } from '@/components/Stat'
import { useOrders } from '@/hooks/useOrders'
import { stageIndex, STAGES } from '@/lib/stages'
import { CheckCircle2Icon, CircleIcon, CreditCardIcon, GaugeIcon, PackageIcon, WalletIcon } from 'lucide-react'
import { Plans } from '@/components/Plans'
import { ProjectStatus } from '@/components/ProjectStatus'
import { UpdateFeed } from '@/components/UpdateFeed'
import { useProject } from '@/hooks/useProject'
import { useSession } from '@/hooks/useSession'
import { normalizeUrl } from '@/lib/url'
import { supabase } from '@/lib/supabase'

const STATUS: Record<string, string> = {
  active: 'Ativa',
  trialing: 'Em período de teste',
  past_due: 'Pagamento em atraso',
  canceled: 'Cancelada',
  unpaid: 'Por pagar',
}
const dateFmt = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' })
const STATUS_TONE: Record<string, 'outline' | 'warn' | 'danger'> = {
  past_due: 'warn',
  unpaid: 'warn',
  canceled: 'danger',
}

export default function Dashboard() {
  // useSession starts empty on every mount, so wait for it before touching the user.
  const { session, loading } = useSession()
  if (loading || !session) return <p className="p-6 text-sm text-muted-foreground">A carregar…</p>
  return <DashboardContent userId={session.user.id} />
}

function DashboardContent({ userId }: { userId: string }) {
  const { profile, project, updates, briefing, loading, status, updatedAt, freshIds } = useProject(userId)
  const [busy, setBusy] = useState(false)
  const [params, setParams] = useSearchParams()
  const [confirming, setConfirming] = useState(false)
  const [briefingSent, setBriefingSent] = useState(false)
  const navigate = useNavigate()
  const orders = useOrders(userId)
  // Links are always shown as absolute addresses, never as paths on this site.
  const liveHref = normalizeUrl(project?.live_url)
  const previewHref = normalizeUrl(project?.preview_url)
  const adminHref = normalizeUrl(project?.admin_url)
  // Clients with a project must finish the briefing: it opens by itself and can't be closed until it's sent.
  const mustFillBriefing = !loading && !!project && !briefing?.submitted_at && !briefingSent

  // Back from Stripe Checkout: the webhook needs a moment to create the project, so don't show the plans again.
  useEffect(() => {
    if (params.get('extra') === 'ok') {
      toast.success('Pagamento recebido! Vamos tratar do seu pedido.')
      setParams({}, { replace: true })
    }
    if (params.get('pago') === 'ok') {
      toast.success('Pagamento recebido! O seu projeto vai aparecer em instantes.')
      setConfirming(true)
      setParams({}, { replace: true })
      const t = setTimeout(() => setConfirming(false), 60000) // give up waiting after a minute
      return () => clearTimeout(t)
    }
  }, [params, setParams])

  async function openPortal() {
    setBusy(true)
    const { data, error } = await supabase.functions.invoke('customer-portal')
    if (error || !data?.url) {
      setBusy(false)
      toast.error('Não foi possível abrir a gestão de pagamento.')
      return
    }
    window.location.href = data.url
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <AppLayout title="O meu projeto">
      {project && (
        <Dialog open={mustFillBriefing} onOpenChange={() => {}}>
          <DialogContent showCloseButton={false} className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Vamos começar o seu projeto</DialogTitle>
              <DialogDescription>
                Responda a estas perguntas para percebermos o que pretende. Leva cerca de 3 minutos e as respostas ficam guardadas a cada passo.
              </DialogDescription>
            </DialogHeader>
            <BriefingWizard project={project} initial={briefing?.answers ?? {}} onSubmitted={() => setBriefingSent(true)} />
            <button type="button" onClick={logout} className="self-center text-xs text-muted-foreground underline">
              Terminar sessão
            </button>
          </DialogContent>
        </Dialog>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
      ) : (
        <>
          {!project && confirming && (
            <Card>
              <CardHeader>
                <CardTitle>A confirmar o pagamento…</CardTitle>
                <CardDescription>Isto demora apenas alguns segundos. Esta página atualiza sozinha.</CardDescription>
              </CardHeader>
            </Card>
          )}

          {!project && !confirming && !profile?.stripe_customer_id && (
            <Card>
              <CardHeader>
                <CardTitle>Escolha o seu plano</CardTitle>
                <CardDescription>Subscreva para começar o seu projeto.</CardDescription>
              </CardHeader>
              <CardContent>
                <Plans />
              </CardContent>
            </Card>
          )}

          {project && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Fase" value={STAGES[stageIndex(project.stage)].label} hint={`${stageIndex(project.stage) + 1} de ${STAGES.length}`} icon={<GaugeIcon />} tone={project.stage === 'online' ? 'live' : undefined} />
                <Stat label="Progresso" value={`${Math.round(((stageIndex(project.stage) + 1) / STAGES.length) * 100)}%`} hint="Até estar online" icon={<CheckCircle2Icon />} />
                <Stat label="Subscrição" value={profile?.subscription_status ? STATUS[profile.subscription_status] ?? profile.subscription_status : '—'} hint={profile?.current_period_end ? `Próxima cobrança ${dateFmt.format(new Date(profile.current_period_end))}` : undefined} icon={<WalletIcon />} tone={profile?.subscription_status && STATUS_TONE[profile.subscription_status] ? 'warn' : undefined} />
                <Stat label="Pedidos extra" value={orders.length} hint={orders.filter((o) => o.status !== 'done').length ? `${orders.filter((o) => o.status !== 'done').length} em curso` : 'Domínio, SEO, logótipo…'} icon={<PackageIcon />} />
              </div>

              <ProjectStatus
                project={project}
                status={status}
                updatedAt={updatedAt}
                liveHref={liveHref}
                previewHref={previewHref}
                adminHref={adminHref}
              />

              <div className="grid gap-4 lg:grid-cols-5">
                <section className="rounded-xl border bg-card p-5 lg:col-span-3">
                  <h2 className="text-base font-semibold">Próximos passos</h2>
                  <ul className="mt-3 grid gap-1 text-sm">
                    {[
                      { done: !!briefing?.submitted_at, text: 'Preencher o briefing', to: '/briefing' },
                      { done: orders.some((o) => o.domain_mode !== 'none'), text: 'Escolher o domínio do website', to: '/servicos' },
                      { done: !!previewHref || project.stage === 'online', text: 'Rever a pré-visualização do design', to: null },
                      { done: project.stage === 'online', text: 'Website online', to: null },
                    ].map((t) => {
                      const Icon = t.done ? CheckCircle2Icon : CircleIcon
                      const inner = (
                        <>
                          <Icon className={t.done ? 'size-4 text-live-text' : 'size-4 text-muted-foreground'} />
                          <span className={t.done ? 'text-muted-foreground line-through' : ''}>{t.text}</span>
                        </>
                      )
                      return (
                        <li key={t.text}>
                          {t.to && !t.done ? <Link to={t.to} className="flex items-center gap-2.5 rounded-md p-2 hover:bg-muted">{inner}</Link> : <div className="flex items-center gap-2.5 p-2">{inner}</div>}
                        </li>
                      )
                    })}
                  </ul>
                </section>
                <section className="grid content-start gap-2 rounded-xl border bg-card p-5 lg:col-span-2">
                  <h2 className="mb-1 text-base font-semibold">Ações rápidas</h2>
                  <Link to="/servicos" className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium hover:bg-muted">Domínio e serviços extra</Link>
                  <Link to="/briefing" className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium hover:bg-muted">Ver ou editar o briefing</Link>
                  {profile?.stripe_customer_id && (
                    <button type="button" onClick={openPortal} disabled={busy} className="flex items-center gap-2 rounded-lg border p-3 text-left text-sm font-medium hover:bg-muted disabled:opacity-60">
                      <CreditCardIcon className="size-4" /> Faturas e método de pagamento
                    </button>
                  )}
                </section>
              </div>

              <ExtrasPanel orders={orders} />

              <Card>
                <CardHeader>
                  <CardTitle>Atualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <UpdateFeed updates={updates} freshIds={freshIds} />
                </CardContent>
              </Card>

              {project.stage !== 'pagamento' && <ReviewCard userId={userId} projectId={project.id} />}
            </>
          )}

          {!project && (profile?.subscription_status || profile?.stripe_customer_id) && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm">
              <div className="space-y-1">
                <p className="font-medium">Subscrição</p>
                <p className="text-muted-foreground">
                  {profile?.subscription_status && (
                    <Badge variant={STATUS_TONE[profile.subscription_status] ?? 'outline'}>{STATUS[profile.subscription_status] ?? profile.subscription_status}</Badge>
                  )}
                  {profile?.current_period_end && (
                    <span className="ml-2">Próxima cobrança: {dateFmt.format(new Date(profile.current_period_end))}</span>
                  )}
                </p>
              </div>
              {profile?.stripe_customer_id && (
                <Button variant="outline" onClick={openPortal} disabled={busy}>Gerir pagamento</Button>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}
