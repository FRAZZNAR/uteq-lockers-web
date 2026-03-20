import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Spin, Result, Button } from 'antd'
import useAuthStore from './stores/authStore'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import AlumnoLayout from './components/layout/AlumnoLayout'

// Carga diferida de páginas
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const LockersPage = lazy(() => import('./pages/admin/LockersPage'))
const AsignacionesPage = lazy(() => import('./pages/admin/AsignacionesPage'))
const UsuariosPage = lazy(() => import('./pages/admin/UsuariosPage'))
const TarjetasRfidPage = lazy(() => import('./pages/admin/TarjetasRfidPage'))
const AccesosPage = lazy(() => import('./pages/admin/AccesosPage'))
const ReportesPage = lazy(() => import('./pages/admin/ReportesPage'))
const AvisosPage = lazy(() => import('./pages/admin/AvisosPage'))
const MiLockerPage = lazy(() => import('./pages/alumno/MiLockerPage'))
const SolicitarCodigoPage = lazy(() => import('./pages/alumno/SolicitarCodigoPage'))
const HistorialPage = lazy(() => import('./pages/alumno/HistorialPage'))
const AvisosAlumnoPage = lazy(() => import('./pages/alumno/AvisosAlumnoPage'))

// Spinner de carga global
const Cargando = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
)

// Redirect inteligente a /admin/dashboard o /alumno/mi-locker
const RootRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/alumno/mi-locker'} replace />
}

const App = () => {

  const hasHydrated = useAuthStore((s) => s._hasHydrated)

  // Espera a que persist termine de leer el localStorage
  if (!hasHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }
  
  return (
    <BrowserRouter>
      <Suspense fallback={<Cargando />}>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Portal Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="Admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="lockers" element={<LockersPage />} />
            <Route path="asignaciones" element={<AsignacionesPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="tarjetas" element={<TarjetasRfidPage />} />
            <Route path="accesos" element={<AccesosPage />} />
            <Route path="reportes" element={<ReportesPage />} />
            <Route path="avisos" element={<AvisosPage />} />
          </Route>

          {/* Portal Alumno */}
          <Route
            path="/alumno"
            element={
              <ProtectedRoute requiredRole="Alumno">
                <AlumnoLayout />
              </ProtectedRoute>
            }
          >
            <Route path="mi-locker" element={<MiLockerPage />} />
            <Route path="solicitar-codigo" element={<SolicitarCodigoPage />} />
            <Route path="historial" element={<HistorialPage />} />
            <Route path="avisos" element={<AvisosAlumnoPage />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <Result
                status="404"
                title="404"
                subTitle="Página no encontrada."
                extra={<Button type="primary" href="/">Ir al inicio</Button>}
              />
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
