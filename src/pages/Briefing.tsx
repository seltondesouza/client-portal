import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AppLayout } from '@/components/AppLayout'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useSession } from '@/hooks/useSession'
import { isFilled, stepsFor, type Answers, type Field } from '@/lib/briefing'
import type { Project } from '@/lib/stages'
import { supabase } from '@/lib/supabase'

export default function Briefing() {
  const { session, loading } = useSession()
  if (loading || !session) return <p className="p-6 text-sm text-muted-foreground">A carregar…</p>
  return (
    <AppLayout title="Briefing">
      <BriefingForm userId={session.user.id} />
    </AppLayout>
  )
}

function FieldInput({ field, value, onChange }: { field: Field; value: string | string[] | undefined; onChange: (v: string | string[]) => void }) {
  if (field.type === 'text') {
    return <Input id={field.key} value={(value as string) ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
  }
  if (field.type === 'textarea') {
    return <Textarea id={field.key} rows={4} value={(value as string) ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
  }
  const multi = field.type === 'multi'
  const current = Array.isArray(value) ? value : value ? [value] : []
  return (
    <ToggleGroup
      multiple={multi}
      variant="outline"
      spacing={2}
      className="flex-wrap justify-start"
      value={current}
      onValueChange={(v) => onChange(multi ? v : (v[0] ?? ''))}
    >
      {field.options!.map((o) => (
        <ToggleGroupItem key={o} value={o}>{o}</ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

function BriefingForm({ userId }: { userId: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [answers, setAnswers] = useState<Answers>({})
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
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

  const steps = stepsFor(project.plan)
  const current = steps[step]
  const last = step === steps.length - 1

  async function save(submit: boolean) {
    setSaving(true)
    const { error } = await supabase.from('briefings').upsert({
      project_id: project!.id,
      answers,
      updated_at: new Date().toISOString(),
      ...(submit ? { submitted_at: new Date().toISOString() } : {}),
    })
    setSaving(false)
    if (error) toast.error('Não foi possível guardar. Tente novamente.')
    return !error
  }

  async function next() {
    const missing = current.fields.some((f) => f.required && !isFilled(answers[f.key]))
    if (missing) return toast.error('Preencha os campos obrigatórios.')
    if (!(await save(last))) return
    if (last) {
      toast.success('Briefing enviado. Obrigado!')
      navigate('/painel')
    } else {
      setStep(step + 1)
    }
  }

  return (
    <Card>
      <CardHeader>
        <p className="text-xs text-muted-foreground">Passo {step + 1} de {steps.length}</p>
        <Progress value={((step + 1) / steps.length) * 100} />
        <CardTitle className="pt-2">{current.title}</CardTitle>
        <CardDescription>{current.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {current.fields.map((f) => (
          <div key={f.key} className="space-y-2">
            <Label htmlFor={f.key}>
              {f.label}
              {f.required && <span aria-hidden> *</span>}
            </Label>
            <FieldInput field={f} value={answers[f.key]} onChange={(v) => setAnswers((a) => ({ ...a, [f.key]: v }))} />
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}>
          Anterior
        </Button>
        <Button disabled={saving} onClick={next}>
          {saving ? 'A guardar…' : last ? 'Enviar' : 'Seguinte'}
        </Button>
      </CardFooter>
    </Card>
  )
}
