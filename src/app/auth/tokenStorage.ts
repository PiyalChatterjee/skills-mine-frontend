import type { JwtTokens } from '@/types/auth'

const TOKEN_STORAGE_KEY = 'skillsmine.auth.tokens'

export const tokenStorage = {
  getTokens(): JwtTokens | null {
    const serialized = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!serialized) return null

    try {
      return JSON.parse(serialized) as JwtTokens
    } catch {
      return null
    }
  },
  setTokens(tokens: JwtTokens): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  },
  clearTokens(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  },
}
