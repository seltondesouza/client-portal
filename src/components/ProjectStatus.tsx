import { ArrowUpRightIcon, EyeIcon } from 'lucide-react'
import { LiveIndicator, type LiveStatus } from '@/components/LiveIndicator'
import { StageTimeline } from '@/components/StageTimeline'
import { buttonVariants } from '@/components/ui/button'
import { PLAN_LABEL, STAGES, stageIndex, stageLabel, type Project } from '@/lib/stages'
import { cn } from '@/lib/utils'

// Dashboard hero card: current phase, live indicator, stage tracker and the one next action.
export function ProjectStatus({
  project, status, updatedAt, liveHref, previewHref, adminHref,
}: {
  project: Project
  status: LiveStatus
  updatedAt: number | null
  liveHref: string | null
  previewHref: string | null
  adminHref: string | null
}) {
  const online = project.stage === 'online'
  return (
    <section className={cn('grid gap-6 rounded-xl border bg-card p-6 transition-colors duration-500', online && 'border-foreground')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">{PLAN_LABEL[project.plan]}</p>
          <h2 className="text-xl font-semibold tracking-tight">
            {online ? 'O seu website está online' : `Fase ${stageIndex(project.stage) + 1} de ${STAGES.length}: ${stageLabel(project.stage)}`}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {online ? 'Tudo pronto. Pode abrir e gerir o seu website.' : 'Aguarde o próximo passo. Esta página atualiza sozinha.'}
          </p>
        </div>
        <LiveIndicator status={status} updatedAt={updatedAt} />
      </div>

      <StageTimeline stage={project.stage} />

      <div className="flex flex-wrap gap-2">
        {online && liveHref && (
          <a href={liveHref} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'live', size: 'lg', className: 'h-10 px-4 text-sm' })}>
            Abrir o meu website <ArrowUpRightIcon />
          </a>
        )}
        {!online && previewHref && (
          <a href={previewHref} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'outline', className: 'h-10 px-4' })}>
            <EyeIcon /> Ver pré-visualização
          </a>
        )}
        {adminHref && (
          <a href={adminHref} target="_blank" rel="noreferrer" className={buttonVariants({ variant: online ? 'outline' : 'default', className: 'h-10 px-4' })}>
            Gerir o meu website
          </a>
        )}
      </div>
      {online && liveHref && <p className="-mt-3 break-all text-sm text-muted-foreground">{liveHref}</p>}
    </section>
  )
}
