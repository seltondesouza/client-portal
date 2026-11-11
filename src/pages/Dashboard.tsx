import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BriefingWizard } from '@/components/BriefingWizard'
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
  // Links are always shown as absolute addresses, never as paths on this site.
  const liveHref = normalizeUrl(project?.live_url)
  const previewHref = normalizeUrl(project?.preview_url)
  const adminHref = normalizeUrl(project?.admin_url)
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
              <ProjectStatus
                project={project}
                status={status}
                updatedAt={updatedAt}
                liveHref={liveHref}
                previewHref={previewHref}
                adminHref={adminHref}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Atualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  <UpdateFeed updates={updates} freshIds={freshIds} />
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/briefing" className="underline">Ver ou editar o briefing</Link>
              </p>
            </>
          )}

          {(profile?.subscription_status || profile?.stripe_customer_id) && (
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
