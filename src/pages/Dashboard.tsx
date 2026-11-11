import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { AppLayout } from '@/components/AppLayout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StageTimeline } from '@/components/StageTimeline'
import { useProject } from '@/hooks/useProject'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'
import { PLAN_LABEL, stageLabel } from '@/lib/stages'

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
  const { session } = useSession()
  const userId = session!.user.id // ProtectedRoute guarantees a session
  const { profile, project, updates, loading } = useProject(userId)
  const [busy, setBusy] = useState(false)

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

  return (
    <AppLayout title="O meu projeto">

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
            <CardContent>
              {profile?.stripe_customer_id ? (
                <Button onClick={openPortal} disabled={busy}>Gerir pagamento</Button>
              ) : (
                <Link to="/" className={buttonVariants()}>Ver planos</Link>
              )}
            </CardContent>
          </Card>

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
                  <CardTitle>Atualizações</CardTitle>
                </CardHeader>
                <CardContent>
                  {updates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ainda sem atualizações.</p>
                  ) : (
                    <ul className="space-y-4">
                      {updates.map((u) => (
                        <li key={u.id} className="border-l-2 pl-3 text-sm">
                          <p className="font-medium">{stageLabel(u.stage)}</p>
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
