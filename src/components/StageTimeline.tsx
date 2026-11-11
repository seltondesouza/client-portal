import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STAGES, stageIndex, type Stage } from '@/lib/stages'

// Stage tracker. Full: numbered nodes joined by a connector that fills left to right when the stage changes,
// the current node is lime with a pulse. Compact: a bar plus one chip per stage (admin list).
export function StageTimeline({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const current = stageIndex(stage)

  if (compact) {
    return (
      <div className="space-y-3" aria-label={`Fase ${current + 1} de ${STAGES.length}: ${STAGES[current].label}`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-in-out-soft"
            style={{ width: `${((current + 1) / STAGES.length) * 100}%` }}
          />
        </div>
        <ol className="flex flex-wrap gap-2 text-xs">
          {STAGES.map((s, i) => (
            <li
              key={s.key}
              aria-current={i === current ? 'step' : undefined}
              className={cn(
                'inline-flex h-[26px] items-center gap-1 rounded-full border px-2.5 text-muted-foreground',
                i === current && 'border-live bg-live font-semibold text-live-foreground',
              )}
            >
              {i < current && <CheckIcon className="size-3" aria-hidden />}
              {s.label}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  return (
    <div className="@container">
      <ol className="grid grid-cols-6">
        {STAGES.map((s, i) => {
          const done = i < current
          const cur = i === current
          return (
            <li
              key={s.key}
              aria-current={cur ? 'step' : undefined}
              className={cn(
                'relative flex min-w-0 flex-col items-center gap-2 text-center',
                // Connector from the previous node: grey track (before) and a primary fill (after) that scales in.
                'before:absolute before:right-1/2 before:top-[13px] before:h-0.5 before:w-full before:bg-border',
                'after:absolute after:right-1/2 after:top-[13px] after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-primary',
                'after:transition-transform after:duration-300 after:ease-in-out-soft',
                'first:before:hidden first:after:hidden',
                (done || cur) && 'after:scale-x-100',
              )}
            >
              <span
                className={cn(
                  'relative z-10 grid size-7 place-items-center rounded-full border-[1.5px] bg-background text-xs font-semibold text-muted-foreground transition-[background-color,border-color,box-shadow] duration-300',
                  'border-input',
                  done && 'border-primary bg-primary text-primary-foreground',
                  cur && 'border-foreground bg-live text-live-foreground shadow-live',
                )}
              >
                {done ? <CheckIcon className="size-3.5" aria-hidden /> : i + 1}
                {cur && <span aria-hidden className="ping pointer-events-none absolute -inset-1.5 rounded-full border-2 border-live" />}
              </span>
              <span className={cn('text-xs leading-4 text-muted-foreground', cur && 'font-semibold text-foreground', !cur && '@max-[520px]:sr-only')}>
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
