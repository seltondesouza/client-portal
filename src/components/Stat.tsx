import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Small metric card used on both dashboards: label, big number, one line of context.
export function Stat({ label, value, hint, icon, tone }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; tone?: 'live' | 'warn' }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        {label}
        {icon && <span className={cn('grid size-7 place-items-center rounded-full bg-muted [&_svg]:size-3.5', tone === 'live' && 'bg-live text-live-foreground', tone === 'warn' && 'bg-warn-tint text-warn')}>{icon}</span>}
      </div>
      <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
