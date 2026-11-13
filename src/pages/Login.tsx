import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HeroShapes } from '@/components/HeroShapes'
import { PasswordStrength } from '@/components/PasswordStrength'
import { LockKeyholeIcon, ShieldCheckIcon, CreditCardIcon } from 'lucide-react'
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
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const { session, loading } = useSession()
  const navigate = useNavigate()

  // After sign-up, wait for the email to be confirmed and continue by ourselves: no refresh, no extra click.
  // The link may be opened in this browser (shared session) or on another device (so we also try to sign in).
  useEffect(() => {
    if (sent !== 'confirmar') return
    let stopped = false
    let ticks = 0
    async function check(tryLogin: boolean) {
      if (stopped) return
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        stopped = true
        navigate('/painel', { replace: true })
        return
      }
      if (tryLogin) {
        const { data: signed } = await supabase.auth.signInWithPassword({ email, password })
        if (signed.session && !stopped) {
          stopped = true
          navigate('/painel', { replace: true })
        }
      }
    }
    const id = setInterval(() => {
      ticks++
      if (ticks > 200) return clearInterval(id) // stop after about 10 minutes
      check(ticks % 3 === 0) // cheap local check every 3 s, a real sign-in attempt every 9 s
    }, 3000)
    const onFocus = () => check(true) // coming back to this tab: check right away
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      stopped = true
      clearInterval(id)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [sent, email, password, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  if (!loading && session) return <Navigate to="/painel" replace />

  async function resend() {
    setCooldown(60)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/painel` },
    })
    if (error) toast.error('Não foi possível reenviar. Tente novamente dentro de alguns minutos.')
    else toast.success('Email reenviado.')
  }

  // 6-digit code from the confirmation email: an alternative to clicking the link.
  async function verifyCode(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
    setBusy(false)
    if (error) return toast.error('Código inválido ou expirado. Peça um novo.')
    navigate('/painel', { replace: true })
  }

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
      ? 'Enviámos um código de confirmação para o seu email.'
      : 'Se o email existir, enviámos um link para definir uma nova palavra-passe.'
    : mode === 'criar'
      ? 'Crie a sua conta para escolher um plano e acompanhar o seu projeto.'
      : mode === 'entrar'
        ? 'Aceda ao seu painel.'
        : 'Indique o seu email para receber um link de recuperação.'

  return (
    <div className="relative">
    <HeroShapes className="opacity-20" />
    <main className="relative mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3">
        <span className="relative grid size-12 place-items-center rounded-full bg-foreground text-background">
          <LockKeyholeIcon className="size-5" />
          <span aria-hidden className="ping pointer-events-none absolute -inset-1.5 rounded-full border-2 border-live" />
        </span>
        <Link to="/" className="text-center text-lg font-semibold">{SITE_NAME}</Link>
      </div>
      <Card className="w-full bg-card/95 shadow-lg backdrop-blur">
        <CardHeader>
          <CardTitle>{sent === 'confirmar' ? 'Confirme o seu email' : TITLE[mode]}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent === 'confirmar' ? (
            <div className="space-y-4 text-center text-sm">
              <details className="rounded-lg border p-3 text-left" open>
              <summary className="cursor-pointer text-center font-medium">Tem um código no email?</summary>
              <form onSubmit={verifyCode} className="mt-3 space-y-3">
                <Label htmlFor="code" className="justify-center">Código de 6 dígitos</Label>
                <Input id="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} className="text-center text-xl tracking-[0.4em]" />
                <Button type="submit" className="w-full" disabled={busy || code.length !== 6}>{busy ? 'A verificar…' : 'Confirmar'}</Button>
              </form>
              </details>
              <div className="flex items-center justify-center gap-3 rounded-lg border p-3 text-muted-foreground">
                <span className="size-3 animate-spin rounded-full border-2 border-foreground border-t-transparent" aria-hidden />
                <span>Ou abra o email e clique no link. Esta página entra sozinha.</span>
              </div>
              <p className="text-muted-foreground">
                Enviado para <span className="font-medium text-foreground">{email}</span>. Verifique também o spam.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" disabled={cooldown > 0} onClick={resend}>
                  {cooldown > 0 ? `Reenviar email (${cooldown}s)` : 'Reenviar email'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSent(null)
                    setMode('criar')
                  }}
                >
                  Usar outro email
                </Button>
              </div>
            </div>
          ) : sent ? (
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
                  {mode === 'criar' && <PasswordStrength value={password} onSuggest={setPassword} />}
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
      <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5"><LockKeyholeIcon className="size-3.5" /> Ligação cifrada (HTTPS)</li>
        <li className="flex items-center gap-1.5"><ShieldCheckIcon className="size-3.5" /> Palavras-passe protegidas</li>
        <li className="flex items-center gap-1.5"><CreditCardIcon className="size-3.5" /> Pagamentos pela Stripe</li>
      </ul>
    </main>
    </div>
  )
}
