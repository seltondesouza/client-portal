import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, EuroIcon, InboxIcon, MessageSquareIcon, RocketIcon, SearchIcon } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { Stat } from '@/components/Stat'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OrdersList, ProjectEditor, ReviewsList, type Row } from '@/components/admin/parts'
import { useAdminData } from '@/hooks/useAdminData'
import { eurCents, orderSummary } from '@/lib/services'
import { PLAN_LABEL, STAGES, stageLabel } from '@/lib/stages'
import { cn } from '@/lib/utils'

const dateFmt = new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short' })
const Loading = () => <p className="text-sm text-muted-foreground">A carregar…</p>

// ---- Overview: what needs doing today, the pipeline, recent orders and activity ----
export function AdminHome() {
  const { rows, briefings, orders, reviews, activity, loading } = useAdminData()
  if (loading) return <AppLayout title="Visão geral"><Loading /></AppLayout>

  const running = rows.filter((r) => r.stage !== 'online')
  const openOrders = orders.filter((o) => o.status !== 'done')
  const pendingReviews = reviews.filter((r) => !r.approved)
  const readyToAdvance = rows.filter((r) => r.stage === 'briefing' && briefings[r.id]?.submitted_at)
  const lateBilling = rows.filter((r) => ['past_due', 'unpaid'].includes(r.profiles?.subscription_status ?? ''))
  const revenue = orders.reduce((n, o) => n + o.amount_cents, 0)
  const counts = STAGES.map((s) => rows.filter((r) => r.stage === s.key).length)
  const max = Math.max(1, ...counts)

  const todo = [
    ...openOrders.map((o) => ({ id: o.id, to: '/admin/pedidos', text: `${o.profiles?.email}: ${orderSummary(o)}`, tag: 'Pedido' })),
    ...readyToAdvance.map((r) => ({ id: r.id, to: '/admin/clientes', text: `${r.profiles?.email} enviou o briefing`, tag: 'Briefing' })),
    ...pendingReviews.map((r) => ({ id: r.id, to: '/admin/reviews', text: `${r.author_name}: "${r.body.slice(0, 50)}"`, tag: 'Review' })),
    ...lateBilling.map((r) => ({ id: r.id + 'b', to: '/admin/clientes', text: `${r.profiles?.email} tem pagamento em atraso`, tag: 'Pagamento' })),
  ]

  return (
    <AppLayout title="Visão geral">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Projetos a decorrer" value={running.length} hint={`${rows.length} no total`} icon={<RocketIcon />} />
        <Stat label="Pedidos por tratar" value={openOrders.length} hint="Domínios e extras" icon={<InboxIcon />} tone={openOrders.length ? 'warn' : undefined} />
        <Stat label="Reviews por aprovar" value={pendingReviews.length} icon={<MessageSquareIcon />} tone={pendingReviews.length ? 'warn' : undefined} />
        <Stat label="Extras vendidos" value={eurCents(revenue)} hint={`${orders.length} pedidos`} icon={<EuroIcon />} tone="live" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border bg-card p-5 lg:col-span-3">
          <h2 className="text-base font-semibold">Precisa de atenção</h2>
          {todo.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Tudo em dia. Não há nada pendente.</p>
          ) : (
            <ul className="mt-3 divide-y text-sm">
              {todo.slice(0, 7).map((t) => (
                <li key={t.id}>
                  <Link to={t.to} className="flex items-center justify-between gap-3 py-2.5 hover:text-muted-foreground">
                    <span className="min-w-0 truncate">{t.text}</span>
                    <Badge variant="outline" className="shrink-0">{t.tag}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Funil de projetos</h2>
          <ul className="mt-3 grid gap-2.5 text-sm">
            {STAGES.map((s, i) => (
              <li key={s.key} className="grid grid-cols-[6.5rem_1fr_1.5rem] items-center gap-2">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-muted">
                  <span className={cn('block h-full rounded-full', s.key === 'online' ? 'bg-live' : 'bg-primary')} style={{ width: `${(counts[i] / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">{counts[i]}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Últimos pedidos</h2>
            <Link to="/admin/pedidos" className="text-xs text-muted-foreground underline">Ver todos</Link>
          </div>
          {orders.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Ainda sem pedidos.</p> : (
            <ul className="mt-3 divide-y text-sm">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate">{orderSummary(o)}<span className="block truncate text-xs text-muted-foreground">{o.profiles?.email}</span></span>
                  <span className="shrink-0 tabular-nums">{o.amount_cents ? eurCents(o.amount_cents) : '—'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">Atividade recente</h2>
          {activity.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Sem atividade.</p> : (
            <ul className="mt-3 divide-y text-sm">
              {activity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate">{a.note ?? stageLabel(a.stage)}<span className="block truncate text-xs text-muted-foreground">{a.projects?.profiles?.email}</span></span>
                  <span className="shrink-0 text-xs text-muted-foreground">{dateFmt.format(new Date(a.created_at))}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Link to="/admin/clientes" className={buttonVariants({ variant: 'outline', className: 'w-fit' })}>Gerir clientes <ArrowRightIcon /></Link>
    </AppLayout>
  )
}

// ---- Clients: searchable table, stage filter, editor in a side sheet ----
export function AdminClientes() {
  const { rows, briefings, loading, reload } = useAdminData()
  const [q, setQ] = useState('')
  const [stage, setStage] = useState<string>('todas')
  const [open, setOpen] = useState<Row | null>(null)
  if (loading) return <AppLayout title="Clientes"><Loading /></AppLayout>

  const term = q.trim().toLowerCase()
  const visible = rows.filter((r) => (stage === 'todas' || r.stage === stage) && (!term || (r.profiles?.email ?? '').toLowerCase().includes(term)))
  const current = open ? rows.find((r) => r.id === open.id) ?? open : null

  return (
    <AppLayout title="Clientes">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" className="pl-9" placeholder="Pesquisar por email…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por fase">
          {[{ key: 'todas', label: 'Todas' }, ...STAGES].map((s) => (
            <button key={s.key} type="button" aria-pressed={stage === s.key} onClick={() => setStage(s.key)}
              className={cn('h-8 rounded-full border px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-foreground', stage === s.key ? 'border-foreground bg-foreground text-background' : 'text-muted-foreground hover:bg-muted')}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Cliente</TableHead><TableHead className="hidden sm:table-cell">Plano</TableHead><TableHead>Fase</TableHead><TableHead className="hidden md:table-cell">Subscrição</TableHead><TableHead /></TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && <TableRow><TableCell colSpan={5} className="text-muted-foreground">Nenhum cliente.</TableCell></TableRow>}
            {visible.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="max-w-48 truncate font-medium">{r.profiles?.email}</TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{PLAN_LABEL[r.plan]}</TableCell>
                <TableCell><Badge variant={r.stage === 'online' ? 'live' : 'outline'}>{stageLabel(r.stage)}</Badge></TableCell>
                <TableCell className="hidden md:table-cell"><Badge variant={['past_due', 'unpaid'].includes(r.profiles?.subscription_status ?? '') ? 'warn' : 'liveSoft'}>{r.profiles?.subscription_status ?? '—'}</Badge></TableCell>
                <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setOpen(r)}>Gerir</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={!!current} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>Gerir projeto</SheetTitle></SheetHeader>
          <div className="px-4 pb-6">
            {current && <ProjectEditor key={current.id + current.stage} row={current} briefing={briefings[current.id]} onSaved={reload} />}
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  )
}

export function AdminPedidos() {
  const { orders, loading, reload } = useAdminData()
  return <AppLayout title="Pedidos">{loading ? <Loading /> : <OrdersList orders={orders} onChanged={reload} />}</AppLayout>
}

export function AdminReviews() {
  const { reviews, loading, reload } = useAdminData()
  return <AppLayout title="Reviews">{loading ? <Loading /> : <ReviewsList reviews={reviews} onChanged={reload} />}</AppLayout>
}
