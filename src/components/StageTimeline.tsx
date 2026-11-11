import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { STAGES, stageIndex, type Stage } from '@/lib/stages'

export function StageTimeline({ stage }: { stage: Stage }) {
  const current = stageIndex(stage)
  return (
    <div className="space-y-4">
      <Progress value={((current + 1) / STAGES.length) * 100} />
      <ol className="space-y-2 text-sm">
        {STAGES.map((s, i) => (
          <li
            key={s.key}
            className={cn(
              'flex items-center gap-3',
              i < current && 'text-muted-foreground',
              i > current && 'text-muted-foreground/50',
              i === current && 'font-semibold',
            )}
          >
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full border text-xs',
                i <= current && 'border-foreground',
                i === current && 'bg-foreground text-background',
              )}
            >
              {i < current ? '✓' : i + 1}
            </span>
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  )
}
