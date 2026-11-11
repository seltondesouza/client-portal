import { useNow } from '@/hooks/useNow'
import { relTime } from '@/lib/time'
import { cn } from '@/lib/utils'

export type LiveStatus = 'live' | 'connecting' | 'offline'

const LABEL: Record<LiveStatus, string> = { live: 'Em direto', connecting: 'A ligar…', offline: 'Sem ligação' }

// Connection + freshness: "Em direto · Atualizado há 12 s". Driven by the Realtime channel status.
export function LiveIndicator({ status, updatedAt, className }: { status: LiveStatus; updatedAt?: number | null; className?: string }) {
  const now = useNow(1000)
  return (
    <span role="status" aria-live="polite" className={cn('inline-flex items-center gap-2 text-xs font-medium text-muted-foreground', className)}>
      <span
        aria-hidden
        className={cn(
          'relative size-2 shrink-0 rounded-full',
          status === 'live' && 'bg-live-text',
          status === 'connecting' && 'bg-warn',
          status === 'offline' && 'bg-muted-foreground/50',
        )}
      >
        {status !== 'offline' && (
          <span className={cn('ping absolute -inset-1 rounded-full', status === 'live' ? 'bg-live' : 'bg-warn opacity-40')} />
        )}
      </span>
      <span className={cn(status === 'live' && 'text-live-text')}>{LABEL[status]}</span>
      {updatedAt && status !== 'connecting' && (
        <>
          <span aria-hidden className="text-muted-foreground/50">·</span>
          <span className="tabular-nums">Atualizado {relTime(updatedAt, now)}</span>
        </>
      )}
    </span>
  )
}
