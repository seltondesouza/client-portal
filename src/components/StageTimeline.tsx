import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { STAGES, stageIndex, type Stage } from '@/lib/stages'

// Compact progress: a bar plus one chip per step (done, current, upcoming).
export function StageTimeline({ stage }: { stage: Stage }) {
  const current = stageIndex(stage)
  return (
    <div className="space-y-3">
      <Progress value={((current + 1) / STAGES.length) * 100} />
      <ol className="flex flex-wrap gap-2 text-xs">
        {STAGES.map((s, i) => (
          <li
            key={s.key}
            className={cn(
              'rounded-full border px-2.5 py-1',
              i < current && 'text-muted-foreground',
              i === current && 'border-foreground bg-foreground font-medium text-background',
              i > current && 'text-muted-foreground/50',
            )}
          >
            {i < current ? '✓ ' : ''}
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  )
}
