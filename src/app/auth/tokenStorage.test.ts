import { describe, it, expect, beforeEach } from 'vitest'
import { tokenStorage } from './tokenStorage'
import type { AuthUser, JwtTokens } from '@/types/auth'

const mockTokens: JwtTokens = {
  accessToken: 'access-123',
  refreshToken: 'refresh-456',
}

const mockUser: AuthUser = {
  id: 'u-1',
  userId: 'u-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  role: 'JOB_SEEKER',
  roles: ['JOB_SEEKER'],
  permissions: ['VIEW_JOBS'],
}

describe('tokenStorage', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('tokens', () => {
    it('returns null when no tokens are stored', () => {
      expect(tokenStorage.getTokens()).toBeNull()
    })

    it('stores and retrieves tokens', () => {
      tokenStorage.setTokens(mockTokens)
      const retrieved = tokenStorage.getTokens()
      expect(retrieved).toEqual(mockTokens)
    })

    it('clearTokens removes tokens', () => {
      tokenStorage.setTokens(mockTokens)
      tokenStorage.clearTokens()
      expect(tokenStorage.getTokens()).toBeNull()
    })
  })

  describe('user', () => {
    it('returns null when no user is stored', () => {
      expect(tokenStorage.getUser()).toBeNull()
    })

    it('stores and retrieves user', () => {
      tokenStorage.setUser(mockUser)
      const retrieved = tokenStorage.getUser()
      expect(retrieved).toEqual(mockUser)
    })

    it('clearUser removes user', () => {
      tokenStorage.setUser(mockUser)
      tokenStorage.clearUser()
      expect(tokenStorage.getUser()).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('removes both tokens and user', () => {
      tokenStorage.setTokens(mockTokens)
      tokenStorage.setUser(mockUser)
      tokenStorage.clearAuth()
      expect(tokenStorage.getTokens()).toBeNull()
      expect(tokenStorage.getUser()).toBeNull()
    })
  })

  describe('error handling', () => {
    it('returns null when stored value is invalid JSON', () => {
      sessionStorage.setItem('skillsmine.auth.tokens', 'not-valid-json')
      expect(tokenStorage.getTokens()).toBeNull()
    })

    it('returns null when stored user is invalid JSON', () => {
      sessionStorage.setItem('skillsmine.auth.user', '{broken')
      expect(tokenStorage.getUser()).toBeNull()
    })
  })
})
