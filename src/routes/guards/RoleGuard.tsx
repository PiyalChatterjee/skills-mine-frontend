import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { tokenStorage } from '@/app/auth/tokenStorage'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { roleToDefaultRoute } from '@/routes/roleDefaultRoutes'
import type { Role } from '@/types/auth'

interface RoleGuardProps {
  allowedRoles: Role[]
  fallbackPath?: string
}

export const RoleGuard = ({
  allowedRoles,
  fallbackPath,
}: RoleGuardProps) => {
  const { hasRole, user } = useAuth()
  const persistedRole = tokenStorage.getUser()?.role
  const effectiveRole = user?.role ?? persistedRole

  if (!effectiveRole) {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />
  }

  if (!hasRole(allowedRoles) && !allowedRoles.includes(effectiveRole)) {
    const redirectPath = fallbackPath ?? roleToDefaultRoute[effectiveRole]
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
