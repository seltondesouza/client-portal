import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { FIELDS } from '@/lib/briefing'
import { normalizeUrl } from '@/lib/url'
import { supabase } from '@/lib/supabase'
import { PLAN_LABEL, STAGES, stageIndex, stageLabel, type Briefing, type Profile, type Project, type Stage } from '@/lib/stages'

type Row = Project & { profiles: Pick<Profile, 'email'> | null }

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
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState(row.preview_url ?? '')
  const [liveUrl, setLiveUrl] = useState(row.live_url ?? '')
  const [busy, setBusy] = useState(false)
  const current = stageIndex(row.stage)
  const next = STAGES[current + 1]
  const prev = STAGES[current - 1]
  const lastStep = next?.key === 'online' // the last step needs the final website address
  const liveOk = !!normalizeUrl(liveUrl)

  async function apply(target: Stage) {
    const previewClean = normalizeUrl(preview)
    const liveClean = normalizeUrl(liveUrl)
    if (preview.trim() && !previewClean) return toast.error('Link de pré-visualização inválido. Exemplo: www.exemplo.pt')
    if (liveUrl.trim() && !liveClean) return toast.error('Endereço final inválido. Exemplo: www.exemplo.pt')
    setBusy(true)
    // The function updates the project and logs the update; the client sees it live on their dashboard.
    const { error } = await supabase.functions.invoke('notify-stage', {
      body: { project_id: row.id, stage: target, note, preview_url: previewClean ?? '', live_url: liveClean ?? '' },
    })
    setBusy(false)
    if (error) return toast.error('Erro ao guardar.')
    toast.success(target === row.stage ? 'Enviado ao cliente.' : `Fase: ${stageLabel(target)}. Cliente atualizado.`)
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
          <div className="space-y-2">
            {lastStep && (
              <div className="space-y-2">
                <Label htmlFor={`u-${row.id}`}>Endereço final do website *</Label>
                <Input
                  id={`u-${row.id}`}
                  inputMode="url"
                  placeholder="www.exemplo.pt"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                />
              </div>
            )}
            <Button size="lg" className="w-full" disabled={busy || (lastStep && !liveOk)} onClick={() => apply(next.key)}>
              {busy ? 'A atualizar…' : lastStep ? 'Publicar: marcar como online' : `Avançar para ${next.label} →`}
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border p-3 text-center text-sm">
            <p className="font-medium">Projeto online ✓</p>
            {normalizeUrl(row.live_url) && (
              <a href={normalizeUrl(row.live_url)!} target="_blank" rel="noreferrer" className="break-all underline">{normalizeUrl(row.live_url)}</a>
            )}
          </div>
        )}

        <details className="rounded-lg border p-3 text-sm">
          <summary className="cursor-pointer text-muted-foreground">Mais opções (nota, link, voltar)</summary>
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`n-${row.id}`}>Nota para o cliente</Label>
              <Textarea id={`n-${row.id}`} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`p-${row.id}`}>Link de pré-visualização</Label>
              <Input id={`p-${row.id}`} inputMode="url" placeholder="www.exemplo.pt" value={preview} onChange={(e) => setPreview(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              A nota e o link seguem com o próximo passo, ou pode enviá-los já, sem mudar de fase.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={busy || (!note && (normalizeUrl(preview) ?? '') === (row.preview_url ?? '') && (normalizeUrl(liveUrl) ?? '') === (row.live_url ?? ''))} onClick={() => apply(row.stage)}>
                Enviar nota / link
              </Button>
              {prev && (
                <Button variant="ghost" disabled={busy} onClick={() => apply(prev.key)}>
                  ← Voltar para {prev.label}
                </Button>
              )}
            </div>
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
