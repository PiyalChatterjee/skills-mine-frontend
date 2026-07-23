import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { roleToDefaultRoute } from '@/routes/roleDefaultRoutes'

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
