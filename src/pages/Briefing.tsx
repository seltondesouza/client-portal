import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { BriefingWizard } from '@/components/BriefingWizard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/hooks/useSession'
import type { Answers } from '@/lib/briefing'
import type { Project } from '@/lib/stages'
import { supabase } from '@/lib/supabase'

export default function Briefing() {
  const { session, loading } = useSession()
  if (loading || !session) return <p className="p-6 text-sm text-muted-foreground">A carregar…</p>
  return (
    <AppLayout title="Briefing">
      <BriefingPage userId={session.user.id} />
    </AppLayout>
  )
}

function BriefingPage({ userId }: { userId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    ;(async () => {
      const { data: p } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      setProject(p)
      if (p) {
        const { data: b } = await supabase.from('briefings').select('answers').eq('project_id', p.id).maybeSingle()
        if (b?.answers) setAnswers(b.answers)
      }
      setReady(true)
    })()
  }, [userId])

  if (!ready) return <p className="text-sm text-muted-foreground">A carregar…</p>
  if (!project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ainda não tem um projeto</CardTitle>
          <CardDescription>O briefing fica disponível depois de subscrever um plano.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link to="/painel" className={buttonVariants()}>Ir para o painel</Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <BriefingWizard project={project} initial={answers} onSubmitted={() => navigate('/painel')} />
      </CardContent>
    </Card>
  )
}
