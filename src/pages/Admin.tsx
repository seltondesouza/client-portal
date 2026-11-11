import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { PLAN_LABEL, STAGES, stageLabel, type Profile, type Project, type Stage } from '@/lib/stages'

type Row = Project & { profiles: Pick<Profile, 'email'> | null }
const items = STAGES.map((s) => ({ value: s.key, label: s.label }))

function ProjectEditor({ row, onSaved }: { row: Row; onSaved: () => void }) {
  const [stage, setStage] = useState<Stage>(row.stage)
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState(row.preview_url ?? '')
  const [busy, setBusy] = useState(false)

  async function save() {
    setBusy(true)
    // The function updates the project, logs the update and emails the client.
    const { error } = await supabase.functions.invoke('notify-stage', {
      body: { project_id: row.id, stage, note, preview_url: preview },
    })
    setBusy(false)
    if (error) return toast.error('Erro ao guardar.')
    toast.success('Guardado e cliente notificado.')
    setNote('')
    onSaved()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {row.profiles?.email}
          <span className="block text-sm font-normal text-muted-foreground">
            {PLAN_LABEL[row.plan]} · {stageLabel(row.stage)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label>Fase</Label>
          <Select items={items} value={stage} onValueChange={(v) => v && setStage(v as Stage)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`n-${row.id}`}>Nota</Label>
          <Textarea id={`n-${row.id}`} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`p-${row.id}`}>Link de pré-visualização</Label>
          <Input id={`p-${row.id}`} type="url" value={preview} onChange={(e) => setPreview(e.target.value)} />
        </div>
        <Button onClick={save} disabled={busy}>{busy ? 'A guardar…' : 'Guardar'}</Button>
      </CardContent>
    </Card>
  )
}

export default function Admin() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
    setRows((data as Row[]) ?? [])
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
            <ProjectEditor key={r.id + r.stage} row={r} onSaved={load} />
          ))}
        </>
      )}
    </AppLayout>
  )
}
