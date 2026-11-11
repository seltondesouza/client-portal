import { Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Admin from '@/pages/Admin'
import Dashboard from '@/pages/Dashboard'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Redefinir from '@/pages/Redefinir'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/redefinir" element={<Redefinir />} />
        <Route path="/painel" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute admin><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  )
}
