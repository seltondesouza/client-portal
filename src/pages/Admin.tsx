import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FIELDS } from '@/lib/briefing'
import { supabase } from '@/lib/supabase'
import { PLAN_LABEL, STAGES, stageIndex, stageLabel, type Briefing, type Profile, type Project, type Stage } from '@/lib/stages'

type Row = Project & { profiles: Pick<Profile, 'email'> | null }
const items = STAGES.map((s) => ({ value: s.key, label: s.label }))

function BriefingView({ briefing }: { briefing?: Briefing }) {
  if (!briefing) return <p className="text-sm text-muted-foreground">Briefing: ainda não iniciado.</p>
  const entries = FIELDS.filter((f) => {
    const v = briefing.answers[f.key]
    return Array.isArray(v) ? v.length > 0 : !!v
  })
  return (
    <details className="rounded-lg border p-3 text-sm">
      <summary className="cursor-pointer font-medium">
        Briefing {briefing.submitted_at ? 'enviado' : 'em curso'} ({entries.length} respostas)
      </summary>
      <dl className="mt-3 space-y-3">
        {entries.map((f) => {
          const v = briefing.answers[f.key]
          return (
            <div key={f.key}>
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd className="whitespace-pre-wrap">{Array.isArray(v) ? v.join(', ') : v}</dd>
            </div>
          )
        })}
      </dl>
    </details>
  )
}

function ProjectEditor({ row, briefing, onSaved }: { row: Row; briefing?: Briefing; onSaved: () => void }) {
  const [stage, setStage] = useState<Stage>(row.stage)
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState(row.preview_url ?? '')
  const [busy, setBusy] = useState(false)
  const current = stageIndex(row.stage)
  const next = STAGES[current + 1]

  async function apply(target: Stage) {
    setBusy(true)
    // The function updates the project and logs the update; the client sees it live on their dashboard.
    const { error } = await supabase.functions.invoke('notify-stage', {
      body: { project_id: row.id, stage: target, note, preview_url: preview },
    })
    setBusy(false)
    if (error) return toast.error('Erro ao guardar.')
    toast.success(`Fase: ${stageLabel(target)}. Cliente atualizado.`)
    setNote('')
    onSaved()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {row.profiles?.email}
          <span className="block text-sm font-normal text-muted-foreground">
            {PLAN_LABEL[row.plan]} · Fase {current + 1} de {STAGES.length}: {stageLabel(row.stage)}
          </span>
        </CardTitle>
        <Progress value={((current + 1) / STAGES.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-3">
        <BriefingView briefing={briefing} />

        {next ? (
          <Button size="lg" className="w-full" disabled={busy} onClick={() => apply(next.key)}>
            {busy ? 'A atualizar…' : `Avançar para ${next.label} →`}
          </Button>
        ) : (
          <p className="rounded-lg border p-3 text-center text-sm font-medium">Projeto online ✓</p>
        )}

        <details className="rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Mais opções (nota, link, escolher fase)</summary>
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`n-${row.id}`}>Nota para o cliente (vai com a próxima atualização)</Label>
              <Textarea id={`n-${row.id}`} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`p-${row.id}`}>Link de pré-visualização</Label>
              <Input id={`p-${row.id}`} type="url" value={preview} onChange={(e) => setPreview(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Escolher a fase</Label>
              <Select items={items} value={stage} onValueChange={(v) => v && setStage(v as Stage)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" disabled={busy} onClick={() => apply(stage)}>
              {busy ? 'A guardar…' : 'Guardar'}
            </Button>
          </div>
        </details>
      </CardContent>
    </Card>
  )
}

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([])
  const [briefings, setBriefings] = useState<Record<string, Briefing>>({})
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
    setRows((data as Row[]) ?? [])
    const { data: b } = await supabase.from('briefings').select('*')
    setBriefings(Object.fromEntries(((b as Briefing[]) ?? []).map((x) => [x.project_id, x])))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const term = q.trim().toLowerCase()
  const visible = rows.filter(
    (r) => !term || (r.profiles?.email ?? '').toLowerCase().includes(term) || PLAN_LABEL[r.plan].toLowerCase().includes(term),
  )

  return (
    <AppLayout title="Clientes e projetos">
      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ainda sem projetos.</p>
      ) : (
        <>
          <Input
            type="search"
            placeholder="Pesquisar por email ou plano…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {visible.length === 0 && <p className="text-sm text-muted-foreground">Nenhum resultado.</p>}
          {visible.map((r) => (
            <ProjectEditor key={r.id + r.stage} row={r} briefing={briefings[r.id]} onSaved={load} />
          ))}
        </>
      )}
    </AppLayout>
  )
}
