import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { isJwtExpired } from '@/app/auth/jwt'
import { ROUTE_PATHS } from '@/routes/routePaths'

export const ProtectedRoute = () => {
  const { isAuthenticated, tokens } = useAuth()
  const location = useLocation()
  const accessToken = tokens?.accessToken
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false

  if (!isAuthenticated || !hasValidAccessToken) {
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
