import { useEffect, useState } from 'react'
import { StarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Review } from '@/lib/services'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function Stars({ n, className }: { n: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} role="img" aria-label={`${n} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} className={cn('size-4', i <= n ? 'fill-foreground' : 'text-muted-foreground/40')} />
      ))}
    </span>
  )
}

// Client dashboard: leave one review. It stays private until the admin approves it.
export function ReviewCard({ userId, projectId }: { userId: string; projectId: string }) {
  const [mine, setMine] = useState<Review | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('reviews').select('*').eq('client_id', userId).maybeSingle().then(({ data }) => setMine((data as Review) ?? null))
  }, [userId])

  if (mine === undefined) return null
  if (mine) {
    return (
      <section className="rounded-xl border bg-card p-6 text-sm">
        <p className="font-semibold">Obrigado pela sua opinião!</p>
        <p className="mt-1 text-muted-foreground">{mine.approved ? 'A sua review já está publicada no site.' : 'A sua review vai aparecer no site depois de a revermos.'}</p>
      </section>
    )
  }

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { data, error } = await supabase
      .from('reviews')
      .insert({ client_id: userId, project_id: projectId, author_name: name.trim(), rating, body: body.trim() })
      .select('*')
      .single()
    setBusy(false)
    if (error) return toast.error('Não foi possível enviar. Verifique os campos.')
    setMine(data as Review)
    toast.success('Obrigado! Vamos rever a sua opinião.')
  }

  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="text-base font-semibold">Como está a correr?</h2>
      <p className="text-sm text-muted-foreground">Deixe uma opinião curta. Ajuda outros negócios a decidir.</p>
      <form onSubmit={send} className="mt-4 grid gap-3">
        <div className="flex gap-1" role="radiogroup" aria-label="Classificação">
          {[1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} estrelas`} onClick={() => setRating(i)} className="rounded outline-none focus-visible:ring-2 focus-visible:ring-foreground">
              <StarIcon className={cn('size-6', i <= rating ? 'fill-foreground' : 'text-muted-foreground/40')} />
            </button>
          ))}
        </div>
        <Input required maxLength={60} placeholder="O seu nome (ou do negócio)" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea required minLength={5} maxLength={600} placeholder="A sua opinião" value={body} onChange={(e) => setBody(e.target.value)} />
        <Button type="submit" disabled={busy} className="w-fit">{busy ? 'A enviar…' : 'Enviar opinião'}</Button>
      </form>
    </section>
  )
}
