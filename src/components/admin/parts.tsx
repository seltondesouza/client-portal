import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Stars } from '@/components/ReviewCard'
import { eurCents, orderSummary, type Order, type Review } from '@/lib/services'
import { FIELDS } from '@/lib/briefing'
import { normalizeUrl } from '@/lib/url'
import { supabase } from '@/lib/supabase'
import { StageTimeline } from '@/components/StageTimeline'
import { PLAN_LABEL, STAGES, stageIndex, stageLabel, type Briefing, type Profile, type Project, type Stage } from '@/lib/stages'

export type Row = Project & { profiles: Pick<Profile, 'email' | 'subscription_status' | 'current_period_end'> | null }

export function BriefingView({ briefing }: { briefing?: Briefing }) {
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

export function ProjectEditor({ row, briefing, onSaved }: { row: Row; briefing?: Briefing; onSaved: () => void }) {
  const [note, setNote] = useState('')
  const [preview, setPreview] = useState(row.preview_url ?? '')
  const [liveUrl, setLiveUrl] = useState(row.live_url ?? '')
  const [adminUrl, setAdminUrl] = useState(row.admin_url ?? '')
  const [busy, setBusy] = useState(false)
  const current = stageIndex(row.stage)
  const next = STAGES[current + 1]
  const prev = STAGES[current - 1]
  const lastStep = next?.key === 'online' // the last step needs the final website address
  const liveOk = !!normalizeUrl(liveUrl)

  async function apply(target: Stage) {
    const previewClean = normalizeUrl(preview)
    const liveClean = normalizeUrl(liveUrl)
    const adminClean = normalizeUrl(adminUrl)
    if (preview.trim() && !previewClean) return toast.error('Link de pré-visualização inválido. Exemplo: www.exemplo.pt')
    if (liveUrl.trim() && !liveClean) return toast.error('Endereço final inválido. Exemplo: www.exemplo.pt')
    if (adminUrl.trim() && !adminClean) return toast.error('Link de administração inválido. Exemplo: www.exemplo.pt/admin')
    setBusy(true)
    // The function updates the project and logs the update; the client sees it live on their dashboard.
    const { error } = await supabase.functions.invoke('notify-stage', {
      body: { project_id: row.id, stage: target, note, preview_url: previewClean ?? '', live_url: liveClean ?? '', admin_url: adminClean ?? '' },
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
        <StageTimeline stage={row.stage} compact />
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
            <div className="space-y-2">
              <Label htmlFor={`a-${row.id}`}>Link de administração do website (opcional)</Label>
              <Input id={`a-${row.id}`} inputMode="url" placeholder="www.exemplo.pt/admin" value={adminUrl} onChange={(e) => setAdminUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">Se preencher, o cliente vê um botão no painel para abrir a administração do site dela.</p>
            </div>
            <p className="text-xs text-muted-foreground">
              A nota e o link seguem com o próximo passo, ou pode enviá-los já, sem mudar de fase.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={busy || (!note && (normalizeUrl(preview) ?? '') === (row.preview_url ?? '') && (normalizeUrl(liveUrl) ?? '') === (row.live_url ?? '') && (normalizeUrl(adminUrl) ?? '') === (row.admin_url ?? ''))} onClick={() => apply(row.stage)}>
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

export type OrderRow = Order & { profiles: Pick<Profile, 'email'> | null }
export type ReviewRow = Review & { profiles: Pick<Profile, 'email'> | null }

export function OrdersList({ orders, onChanged }: { orders: OrderRow[]; onChanged: () => void }) {
  async function done(o: OrderRow) {
    const { error } = await supabase.from('orders').update({ status: o.status === 'done' ? 'paid' : 'done' }).eq('id', o.id)
    if (error) return toast.error('Erro ao guardar.')
    onChanged()
  }
  if (!orders.length) return <p className="text-sm text-muted-foreground">Ainda sem pedidos.</p>
  return (
    <ul className="grid gap-3">
      {orders.map((o) => (
        <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 text-sm">
          <div className="min-w-0">
            <p className="font-medium">{orderSummary(o)}</p>
            <p className="truncate text-xs text-muted-foreground">
              {o.profiles?.email} · {o.amount_cents ? eurCents(o.amount_cents) : 'Sem custo'}
              {o.domain_mode === 'buy' && ' · registar o domínio e ligá-lo à Vercel'}
              {o.domain_mode === 'unsure' && ' · sugerir nomes ao cliente'}
            </p>
          </div>
          <Button size="sm" variant={o.status === 'done' ? 'outline' : 'default'} onClick={() => done(o)}>
            {o.status === 'done' ? 'Concluído ✓' : 'Marcar concluído'}
          </Button>
        </li>
      ))}
    </ul>
  )
}

export function ReviewsList({ reviews, onChanged }: { reviews: ReviewRow[]; onChanged: () => void }) {
  async function setApproved(r: ReviewRow, approved: boolean) {
    const { error } = await supabase.from('reviews').update({ approved }).eq('id', r.id)
    if (error) return toast.error('Erro ao guardar.')
    onChanged()
  }
  async function remove(r: ReviewRow) {
    if (!confirm('Apagar esta review?')) return
    await supabase.from('reviews').delete().eq('id', r.id)
    onChanged()
  }
  if (!reviews.length) return <p className="text-sm text-muted-foreground">Ainda sem reviews. Os clientes deixam-nas no painel deles.</p>
  return (
    <ul className="grid gap-3">
      {reviews.map((r) => (
        <li key={r.id} className="grid gap-2 rounded-xl border bg-card p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2"><Stars n={r.rating} /><strong>{r.author_name}</strong></span>
            <Badge variant={r.approved ? 'liveSoft' : 'warn'}>{r.approved ? 'Publicada' : 'Por aprovar'}</Badge>
          </div>
          <p>{r.body}</p>
          <div className="flex gap-2">
            <Button size="sm" variant={r.approved ? 'outline' : 'default'} onClick={() => setApproved(r, !r.approved)}>{r.approved ? 'Despublicar' : 'Publicar'}</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(r)}>Apagar</Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

