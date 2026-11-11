import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-5xl font-semibold">404</p>
      <p className="text-muted-foreground">Esta página não existe.</p>
      <Link to="/" className={buttonVariants()}>Voltar ao início</Link>
    </main>
  )
}
