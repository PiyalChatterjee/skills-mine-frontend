import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { Role } from '@/types/auth'

const roleToDefaultRoute: Record<Role, string> = {
  candidate: ROUTE_PATHS.profile,
  recruiter: ROUTE_PATHS.recruiter,
  manco: ROUTE_PATHS.manco,
  exco: ROUTE_PATHS.exco,
  admin: ROUTE_PATHS.dashboard,
}

export const PortalRoute = () => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.login} replace />
  }

  if (user) {
    return <Navigate to={roleToDefaultRoute[user.role]} replace />
  }

  return <Outlet />
}
