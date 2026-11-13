import { useEffect, useState } from 'react'
import { Stars } from '@/components/ReviewCard'
import { Reveal } from '@/components/Reveal'
import type { Review } from '@/lib/services'
import { supabase } from '@/lib/supabase'

// Homepage: approved client reviews only. Renders nothing until there is at least one.
export function Reviews() {
  const [list, setList] = useState<Review[]>([])
  useEffect(() => {
    supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setList((data as Review[]) ?? []))
  }, [])
  if (list.length === 0) return null
  const avg = list.reduce((n, r) => n + r.rating, 0) / list.length
  return (
    <section className="mx-auto max-w-5xl px-4 py-24">
      <Reveal>
        <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Opiniões</p>
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl">O que dizem os clientes</h2>
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Stars n={Math.round(avg)} /> {avg.toFixed(1)} de média · {list.length} {list.length === 1 ? 'opinião' : 'opiniões'}
        </p>
      </Reveal>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {list.map((r, i) => (
          <li key={r.id}>
            <Reveal delay={i * 90} className="h-full">
              <figure className="flex h-full flex-col gap-4 rounded-xl border bg-card p-6">
                <Stars n={r.rating} />
                <blockquote className="text-[15px] leading-relaxed">“{r.body}”</blockquote>
                <figcaption className="mt-auto text-sm font-medium">{r.author_name}</figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
