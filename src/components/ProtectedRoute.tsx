import { Navigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'

export function ProtectedRoute({ admin = false, children }: { admin?: boolean; children: React.ReactNode }) {
  const { session, loading, isAdmin } = useSession()
  if (loading) return <p className="p-6 text-sm text-muted-foreground">A carregar…</p>
  if (!session) return <Navigate to="/entrar" replace />
  if (admin && !isAdmin) return <Navigate to="/painel" replace />
  return <>{children}</>
}
