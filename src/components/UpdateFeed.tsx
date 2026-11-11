import { Badge } from '@/components/ui/badge'
import { useNow } from '@/hooks/useNow'
import { relTime } from '@/lib/time'
import { stageMessage, type ProjectUpdate } from '@/lib/stages'
import { cn } from '@/lib/utils'

// Project history. Updates received during this visit are lime-tinted, slide in and carry a "Novo" badge.
export function UpdateFeed({ updates, freshIds }: { updates: ProjectUpdate[]; freshIds: Set<string> }) {
  const now = useNow(1000)
  if (updates.length === 0) return <p className="text-sm text-muted-foreground">Ainda sem atualizações.</p>
  return (
    <ol className="grid" aria-live="polite">
      {updates.map((u, i) => {
        const fresh = freshIds.has(u.id)
        const showStage = u.stage !== updates[i + 1]?.stage
        return (
          <li
            key={u.id}
            className={cn(
              'relative grid grid-cols-[20px_1fr] gap-3 rounded-lg py-3 pr-3 pl-2 text-sm',
              // vertical connector between dots
              'before:absolute before:top-[30px] before:-bottom-3 before:left-[17px] before:w-0.5 before:bg-border last:before:hidden',
              fresh && 'feed-in bg-live-tint',
            )}
          >
            <span aria-hidden className={cn('mt-1 ml-1 size-3 rounded-full border-2 border-foreground bg-background', fresh && 'bg-live')} />
            <div>
              {showStage && <p className="font-semibold">{stageMessage(u.stage)}</p>}
              {u.note && <p className="mt-0.5">{u.note}</p>}
              <p className="mt-1 flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                {relTime(u.created_at, now)}
                {fresh && <Badge variant="liveSoft">Novo</Badge>}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
