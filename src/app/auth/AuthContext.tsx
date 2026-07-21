import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { tokenStorage } from '@/app/auth/tokenStorage'
import { isJwtExpired } from '@/app/auth/jwt'
import type {
  AuthSession,
  AuthUser,
  JwtTokens,
  Permission,
  Role,
} from '@/types/auth'

type LoginPayload = {
  user: AuthUser
  tokens: JwtTokens
}

interface AuthContextValue extends AuthSession {
  login: (payload: LoginPayload) => void
  logout: () => void
  hasRole: (roles: Role[]) => boolean
  hasPermission: (permissions: Permission[]) => boolean
}

const defaultState: AuthSession = {
  user: null,
  tokens: null,
  isAuthenticated: false,
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<AuthSession>(defaultState)

  useEffect(() => {
    const tokens = tokenStorage.getTokens()
    if (!tokens?.accessToken || isJwtExpired(tokens.accessToken)) {
      tokenStorage.clearTokens()
      return
    }

    // User hydration is intentionally deferred to a future profile endpoint.
    setSession((current) => ({
      ...current,
      tokens,
      isAuthenticated: true,
    }))
  }, [])

  const login = useCallback((payload: LoginPayload) => {
    tokenStorage.setTokens(payload.tokens)
    setSession({
      user: payload.user,
      tokens: payload.tokens,
      isAuthenticated: true,
    })
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clearTokens()
    setSession(defaultState)
  }, [])

  const hasRole = useCallback(
    (roles: Role[]) => Boolean(session.user && roles.includes(session.user.role)),
    [session.user],
  )

  const hasPermission = useCallback(
    (permissions: Permission[]) => {
      if (!session.user) return false
      return permissions.every((permission) =>
        session.user?.permissions.includes(permission),
      )
    },
    [session.user],
  )

  const value = useMemo(
    () => ({
      ...session,
      login,
      logout,
      hasRole,
      hasPermission,
    }),
    [hasPermission, hasRole, login, logout, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
