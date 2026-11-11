import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/AppLayout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BriefingWizard } from '@/components/BriefingWizard'
import { Plans } from '@/components/Plans'
import { StageTimeline } from '@/components/StageTimeline'
import { useProject } from '@/hooks/useProject'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { PLAN_LABEL, stageLabel, stageMessage } from '@/lib/stages'

const STATUS: Record<string, string> = {
  active: 'Ativa',
  trialing: 'Em período de teste',
  past_due: 'Pagamento em atraso',
  canceled: 'Cancelada',
  unpaid: 'Por pagar',
}
const dateFmt = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' })
const dateTimeFmt = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium', timeStyle: 'short' })

export default function Dashboard() {
  // useSession starts empty on every mount, so wait for it before touching the user.
  const { session, loading } = useSession()
  if (loading || !session) return <p className="p-6 text-sm text-muted-foreground">A carregar…</p>
  return <DashboardContent userId={session.user.id} />
}

function DashboardContent({ userId }: { userId: string }) {
  const { profile, project, updates, briefing, loading } = useProject(userId)
  const [busy, setBusy] = useState(false)
  const [params, setParams] = useSearchParams()
  const [confirming, setConfirming] = useState(false)
  const [briefingSent, setBriefingSent] = useState(false)
  const navigate = useNavigate()
  // Clients with a project must finish the briefing: it opens by itself and can't be closed until it's sent.
  const mustFillBriefing = !loading && !!project && !briefing?.submitted_at && !briefingSent

  // Back from Stripe Checkout: the webhook needs a moment to create the project, so don't show the plans again.
  useEffect(() => {
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
          <Card>
            <CardHeader>
              <CardTitle>Subscrição</CardTitle>
              <CardDescription>
                {profile?.subscription_status ? (
                  <>
                    <Badge variant="outline">{STATUS[profile.subscription_status] ?? profile.subscription_status}</Badge>
                    {profile.current_period_end && (
                      <span className="ml-2">Próxima cobrança: {dateFmt.format(new Date(profile.current_period_end))}</span>
                    )}
                  </>
                ) : (
                  'Sem subscrição ativa.'
                )}
              </CardDescription>
            </CardHeader>
            {profile?.stripe_customer_id && (
              <CardContent>
                <Button onClick={openPortal} disabled={busy}>Gerir pagamento</Button>
              </CardContent>
            )}
          </Card>

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
              <Card>
                <CardHeader>
                  <CardTitle>{PLAN_LABEL[project.plan]}</CardTitle>
                  <CardDescription>Fase atual: {stageLabel(project.stage)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <StageTimeline stage={project.stage} />
                  {project.preview_url && (
                    <a
                      href={project.preview_url}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: 'outline' })}
                    >
                      Ver pré-visualização do design
                    </a>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Briefing</CardTitle>
                  <CardDescription>
                    {briefing?.submitted_at
                      ? 'Recebemos o seu briefing. Pode editá-lo se precisar.'
                      : briefing
                        ? 'Começou o briefing. Continue de onde ficou.'
                        : 'Responda a algumas perguntas para percebermos o que pretende.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/briefing" className={buttonVariants({ variant: briefing?.submitted_at ? 'outline' : 'default' })}>
                    {briefing?.submitted_at ? 'Ver ou editar briefing' : briefing ? 'Continuar briefing' : 'Preencher briefing'}
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  {updates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ainda sem atualizações.</p>
                  ) : (
                    <ul className="space-y-4">
                      {updates.map((u, i) => (
                        <li key={u.id} className="border-l-2 pl-3 text-sm">
                          {u.stage !== updates[i + 1]?.stage && <p className="font-medium">{stageMessage(u.stage)}</p>}
                          {u.note && <p>{u.note}</p>}
                          <p className="text-xs text-muted-foreground">{dateTimeFmt.format(new Date(u.created_at))}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </AppLayout>
  )
}
