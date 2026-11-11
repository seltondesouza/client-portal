import { useReveal } from '@/hooks/useReveal'
import { cn } from '@/lib/utils'

export function Reveal({ className, delay = 0, children }: { className?: string; delay?: number; children: React.ReactNode }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={cn('reveal', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
