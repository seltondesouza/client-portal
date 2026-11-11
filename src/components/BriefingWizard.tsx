import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { isFilled, stepsFor, type Answers, type Field } from '@/lib/briefing'
import type { Project } from '@/lib/stages'
import { supabase } from '@/lib/supabase'

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

// The step-by-step questionnaire. Saves after every step; the last step marks it as sent.
export function BriefingWizard({ project, initial, onSubmitted }: { project: Project; initial: Answers; onSubmitted: () => void }) {
  const [answers, setAnswers] = useState<Answers>(initial)
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const steps = stepsFor(project.plan)
  const current = steps[step]
  const last = step === steps.length - 1

  async function save(submit: boolean) {
    setSaving(true)
    const { error } = await supabase.from('briefings').upsert({
      project_id: project.id,
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
      onSubmitted()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Passo {step + 1} de {steps.length}</p>
        <Progress value={((step + 1) / steps.length) * 100} />
        <h3 className="pt-2 text-lg font-semibold">{current.title}</h3>
        <p className="text-sm text-muted-foreground">{current.description}</p>
      </div>
      {current.fields.map((f) => (
        <div key={f.key} className="space-y-2">
          <Label htmlFor={f.key}>
            {f.label}
            {f.required && <span aria-hidden> *</span>}
          </Label>
          <FieldInput field={f} value={answers[f.key]} onChange={(v) => setAnswers((a) => ({ ...a, [f.key]: v }))} />
        </div>
      ))}
      <div className="flex justify-between pt-2">
        <Button variant="outline" disabled={step === 0 || saving} onClick={() => setStep(step - 1)}>
          Anterior
        </Button>
        <Button disabled={saving} onClick={next}>
          {saving ? 'A guardar…' : last ? 'Enviar' : 'Seguinte'}
        </Button>
      </div>
    </div>
  )
}
