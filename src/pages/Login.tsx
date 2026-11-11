import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/painel` },
    })
    setBusy(false)
    if (error) toast.error('Não foi possível enviar o link. Tente novamente.')
    else setSent(true)
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            {sent ? 'Enviámos um link de acesso para o seu email.' : 'Receba um link de acesso por email. Sem palavra-passe.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Usar outro email
            </Button>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'A enviar…' : 'Enviar link'}
              </Button>
            </form>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline">Ver planos</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
