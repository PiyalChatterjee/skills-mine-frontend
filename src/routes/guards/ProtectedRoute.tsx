import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { isJwtExpired } from '@/app/auth/jwt'
import { tokenStorage } from '@/app/auth/tokenStorage'
import { ROUTE_PATHS } from '@/routes/routePaths'

export const ProtectedRoute = () => {
  const { isAuthenticated, tokens } = useAuth()
  const location = useLocation()
  const persistedTokens = tokenStorage.getTokens()
  const accessToken = tokens?.accessToken ?? persistedTokens?.accessToken
  const hasValidAccessToken = accessToken ? !isJwtExpired(accessToken) : false
  const hasAuthenticatedSession = isAuthenticated || hasValidAccessToken

  if (!hasAuthenticatedSession) {
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
