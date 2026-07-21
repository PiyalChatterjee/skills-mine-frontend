import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Role } from '@/types/auth'

interface RoleGuardProps {
  allowedRoles: Role[]
  fallbackPath?: string
}

export const RoleGuard = ({
  allowedRoles,
  fallbackPath = ROUTE_PATHS.dashboard,
}: RoleGuardProps) => {
  const { hasRole } = useAuth()

  if (!hasRole(allowedRoles)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
