import { Link } from 'react-router-dom'
import { LEGAL_UPDATED, SITE_NAME } from '@/lib/site'

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <Link to="/" className="font-semibold">{SITE_NAME}</Link>
        <Link to="/" className="text-sm underline">Voltar ao início</Link>
      </header>
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Última atualização: {LEGAL_UPDATED}</p>
        </div>
        <div className="space-y-6 text-sm leading-relaxed [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  )
}
