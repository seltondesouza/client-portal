import { Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminClientes, AdminHome, AdminPedidos, AdminReviews } from '@/pages/Admin'
import Briefing from '@/pages/Briefing'
import Dashboard from '@/pages/Dashboard'
import Landing from '@/pages/Landing'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Privacidade from '@/pages/Privacidade'
import Redefinir from '@/pages/Redefinir'
import Servicos from '@/pages/Servicos'
import Termos from '@/pages/Termos'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/redefinir" element={<Redefinir />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="/privacidade" element={<Privacidade />} />
        <Route path="/painel" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/servicos" element={<ProtectedRoute><Servicos /></ProtectedRoute>} />
        <Route path="/briefing" element={<ProtectedRoute><Briefing /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute admin><AdminHome /></ProtectedRoute>} />
        <Route path="/admin/clientes" element={<ProtectedRoute admin><AdminClientes /></ProtectedRoute>} />
        <Route path="/admin/pedidos" element={<ProtectedRoute admin><AdminPedidos /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute admin><AdminReviews /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  )
}
