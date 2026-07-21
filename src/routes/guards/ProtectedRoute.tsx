import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { ROUTE_PATHS } from '@/routes/routePaths'

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return (
      <Navigate
        to={ROUTE_PATHS.login}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}
