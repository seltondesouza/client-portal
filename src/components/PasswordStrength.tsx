import { CheckIcon, SparklesIcon } from 'lucide-react'
import { toast } from 'sonner'
import { generatePassword, strength } from '@/lib/password'
import { cn } from '@/lib/utils'

const TONE = ['bg-destructive', 'bg-destructive', 'bg-warn', 'bg-live-text', 'bg-live-text']

// Strength meter, tips and a "suggest a strong password" button. Shown under the password field when creating an account.
export function PasswordStrength({ value, onSuggest }: { value: string; onSuggest: (pw: string) => void }) {
  const s = strength(value)

  async function suggest() {
    const pw = generatePassword()
    onSuggest(pw)
    try {
      await navigator.clipboard.writeText(pw)
      toast.success('Palavra-passe forte criada e copiada. Guarde-a num gestor de palavras-passe.')
    } catch {
      toast.success('Palavra-passe forte criada. Guarde-a num gestor de palavras-passe.')
    }
  }

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full bg-muted transition-colors duration-300', value && s.score >= i && TONE[s.score])} />
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn('font-medium', !value && 'text-muted-foreground')}>{value ? `Segurança: ${s.label}` : 'Mínimo de 8 caracteres.'}</span>
        <button type="button" onClick={suggest} className="inline-flex items-center gap-1 rounded text-foreground underline outline-none focus-visible:ring-2 focus-visible:ring-foreground">
          <SparklesIcon className="size-3" /> Sugerir uma forte
        </button>
      </div>
      {value && s.score < 3 && (
        <ul className="space-y-0.5 text-xs text-muted-foreground">
          {s.tips.slice(0, 2).map((t) => <li key={t}>• {t}</li>)}
        </ul>
      )}
      {value && s.score >= 3 && (
        <p className="flex items-center gap-1 text-xs text-live-text"><CheckIcon className="size-3" /> Boa escolha.</p>
      )}
    </div>
  )
}
