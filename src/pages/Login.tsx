import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HeroShapes } from '@/components/HeroShapes'
import { PasswordInput } from '@/components/PasswordInput'
import { Label } from '@/components/ui/label'
import { useSession } from '@/hooks/useSession'
import { SITE_NAME } from '@/lib/site'
import { supabase } from '@/lib/supabase'

type Mode = 'entrar' | 'criar' | 'recuperar'

const TITLE: Record<Mode, string> = { entrar: 'Entrar', criar: 'Criar conta', recuperar: 'Recuperar palavra-passe' }

export default function Login() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState<Mode>(params.get('modo') === 'criar' ? 'criar' : 'entrar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState<null | 'confirmar' | 'recuperar'>(null)
  const [busy, setBusy] = useState(false)
  const { session, loading } = useSession()

  if (!loading && session) return <Navigate to="/painel" replace />

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const origin = window.location.origin

    if (mode === 'entrar') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(
          error.message.toLowerCase().includes('not confirmed')
            ? 'Confirme primeiro o seu email (verifique a caixa de entrada).'
            : 'Email ou palavra-passe incorretos.',
        )
      }
      // On success useSession updates and the redirect above takes over.
    } else if (mode === 'criar') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/painel` },
      })
      if (error) toast.error('Não foi possível criar a conta. Verifique os dados e tente novamente.')
      else setSent('confirmar')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/redefinir` })
      if (error) toast.error('Não foi possível enviar o email. Tente novamente.')
      else setSent('recuperar')
    }
    setBusy(false)
  }

  const description = sent
    ? sent === 'confirmar'
      ? 'Enviámos um email de confirmação. Clique no link para ativar a conta e entrar.'
      : 'Se o email existir, enviámos um link para definir uma nova palavra-passe.'
    : mode === 'criar'
      ? 'Crie a sua conta para escolher um plano e acompanhar o seu projeto.'
      : mode === 'entrar'
        ? 'Aceda ao seu painel.'
        : 'Indique o seu email para receber um link de recuperação.'

  return (
    <div className="relative">
    <HeroShapes />
    <main className="relative mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-4">
      <Link to="/" className="text-center text-lg font-semibold">{SITE_NAME}</Link>
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle>{TITLE[mode]}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(null)
                setMode('entrar')
              }}
            >
              Voltar a entrar
            </Button>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {mode !== 'recuperar' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Palavra-passe</Label>
                  <PasswordInput
                    id="password"
                    autoComplete={mode === 'criar' ? 'new-password' : 'current-password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {mode === 'criar' && <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>}
                </div>
              )}
              {mode === 'criar' && (
                <p className="text-xs text-muted-foreground">
                  Ao criar conta aceita os <Link to="/termos" className="underline">Termos</Link> e a{' '}
                  <Link to="/privacidade" className="underline">Política de Privacidade</Link>.
                </p>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? 'Aguarde…' : mode === 'entrar' ? 'Entrar' : mode === 'criar' ? 'Criar conta' : 'Enviar link'}
              </Button>
            </form>
          )}

          {!sent && (
            <div className="mt-4 space-y-1 text-center text-sm text-muted-foreground">
              {mode === 'entrar' && (
                <>
                  <p>
                    Ainda não tem conta?{' '}
                    <button type="button" className="underline" onClick={() => setMode('criar')}>Criar conta</button>
                  </p>
                  <p>
                    <button type="button" className="underline" onClick={() => setMode('recuperar')}>Esqueci-me da palavra-passe</button>
                  </p>
                </>
              )}
              {mode !== 'entrar' && (
                <p>
                  <button type="button" className="underline" onClick={() => setMode('entrar')}>Já tenho conta</button>
                </p>
              )}
            </div>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline">Voltar ao início</Link>
          </p>
        </CardContent>
      </Card>
    </main>
    </div>
  )
}
