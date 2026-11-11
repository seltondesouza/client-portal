import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/PasswordInput'
import { Label } from '@/components/ui/label'
import { useSession } from '@/hooks/useSession'
import { supabase } from '@/lib/supabase'

// Landing page of the "recover password" email link: Supabase signs the user in, then they pick a new password.
export default function Redefinir() {
  const { session, loading } = useSession()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return toast.error('Não foi possível guardar a nova palavra-passe.')
    toast.success('Palavra-passe atualizada.')
    navigate('/painel')
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Nova palavra-passe</CardTitle>
          <CardDescription>
            {loading ? 'A verificar o link…' : session ? 'Escolha uma nova palavra-passe.' : 'Este link é inválido ou expirou.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!loading && session ? (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Palavra-passe</Label>
                <PasswordInput id="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Aguarde…' : 'Guardar'}</Button>
            </form>
          ) : (
            !loading && <Link to="/entrar" className="text-sm underline">Voltar a entrar</Link>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
