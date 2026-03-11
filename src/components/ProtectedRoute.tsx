import { Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import useAuth from '../hooks/useAuth'
import type { Rol } from '../types'

interface Props {
  requiredRole?: Rol
  children: React.ReactNode
}

const ProtectedRoute = ({ requiredRole, children }: Props) => {
  const { isAuthenticated, usuario } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && usuario?.rol !== requiredRole) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="No tienes permiso para acceder a esta sección."
        extra={<Button type="primary" href="/login">Ir al inicio</Button>}
      />
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
