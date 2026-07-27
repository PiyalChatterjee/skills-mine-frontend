import type { AuthUser, JwtTokens } from '@/types/auth'

const TOKEN_STORAGE_KEY = 'skillsmine.auth.tokens'
const USER_STORAGE_KEY = 'skillsmine.auth.user'

const parseStoredValue = <T>(rawValue: string | null): T | null => {
  if (!rawValue) return null

  try {
    return JSON.parse(rawValue) as T
  } catch {
    return null
  }
}

export const tokenStorage = {
  getTokens(): JwtTokens | null {
    return parseStoredValue<JwtTokens>(
      sessionStorage.getItem(TOKEN_STORAGE_KEY),
    )
  },
  getUser(): AuthUser | null {
    return parseStoredValue<AuthUser>(sessionStorage.getItem(USER_STORAGE_KEY))
  },
  setTokens(tokens: JwtTokens): void {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  },
  setUser(user: AuthUser): void {
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  },
  clearTokens(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  },
  clearUser(): void {
    sessionStorage.removeItem(USER_STORAGE_KEY)
  },
  clearAuth(): void {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)
  },
}
