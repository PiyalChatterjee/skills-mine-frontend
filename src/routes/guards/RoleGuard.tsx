import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { tokenStorage } from '@/app/auth/tokenStorage'
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
  const { hasRole, user } = useAuth()
  const persistedRole = tokenStorage.getUser()?.role
  const effectiveRole = user?.role ?? persistedRole

  if (!effectiveRole) {
    return <Navigate to={fallbackPath} replace />
  }

  if (!hasRole(allowedRoles) && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
