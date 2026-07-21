import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Permission } from '@/types/auth'

interface PermissionGuardProps {
  requiredPermissions: Permission[]
  fallbackPath?: string
}

export const PermissionGuard = ({
  requiredPermissions,
  fallbackPath = ROUTE_PATHS.dashboard,
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth()

  if (!hasPermission(requiredPermissions)) {
    return <Navigate to={fallbackPath} replace />
  }

  return <Outlet />
}
