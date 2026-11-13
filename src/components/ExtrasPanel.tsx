import { Link } from 'react-router-dom'
import { SparklesIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { eurCents, orderSummary, type Order } from '@/lib/services'

const dateFmt = new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' })

// Client dashboard: one call to action for extra services and the list of what they already ordered.
export function ExtrasPanel({ orders }: { orders: Order[] }) {
  return (
    <section className="grid gap-4 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Domínio e serviços extra</h2>
          <p className="text-sm text-muted-foreground">Escolha o seu domínio, peça um redesign, SEO, logótipo e mais.</p>
        </div>
        <Link to="/servicos" className={buttonVariants({ className: 'h-10 px-4' })}>
          <SparklesIcon /> Ver serviços
        </Link>
      </div>
      {orders.length > 0 && (
        <ul className="divide-y rounded-lg border text-sm">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <p className="font-medium">{orderSummary(o)}</p>
                <p className="text-xs text-muted-foreground">{dateFmt.format(new Date(o.created_at))} · {o.amount_cents ? eurCents(o.amount_cents) : 'Sem custo'}</p>
              </div>
              <Badge variant={o.status === 'done' ? 'liveSoft' : 'outline'}>{o.status === 'done' ? 'Concluído' : 'Em curso'}</Badge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
