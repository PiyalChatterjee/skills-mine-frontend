import { describe, it, expect } from 'vitest'
import authReducer, {
  setAuthSession,
  clearAuthSession,
  setAuthStatus,
} from './authSlice'
import type { AuthUser, JwtTokens } from '@/types/auth'

const mockTokens: JwtTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'refresh-token-456',
}

const mockUser: AuthUser = {
  id: 'user-1',
  userId: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  role: 'JOB_SEEKER',
  roles: ['JOB_SEEKER'],
  permissions: ['VIEW_JOBS', 'APPLY_JOB', 'UPLOAD_CV', 'VIEW_DASHBOARD'],
}

describe('authSlice', () => {
  describe('initial state', () => {
    it('has null user, null tokens, isAuthenticated false, and idle status', () => {
      const state = authReducer(undefined, { type: '@@INIT' })
      expect(state.user).toBeNull()
      expect(state.tokens).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.status).toBe('idle')
    })
  })

  describe('setAuthSession', () => {
    it('sets user and tokens, marks isAuthenticated true and status authenticated', () => {
      const state = authReducer(
        undefined,
        setAuthSession({ user: mockUser, tokens: mockTokens }),
      )
      expect(state.user).toEqual(mockUser)
      expect(state.tokens).toEqual(mockTokens)
      expect(state.isAuthenticated).toBe(true)
      expect(state.status).toBe('authenticated')
    })
  })

  describe('clearAuthSession', () => {
    it('clears user and tokens, marks isAuthenticated false and status unauthenticated', () => {
      const authenticatedState = authReducer(
        undefined,
        setAuthSession({ user: mockUser, tokens: mockTokens }),
      )
      const clearedState = authReducer(authenticatedState, clearAuthSession())
      expect(clearedState.user).toBeNull()
      expect(clearedState.tokens).toBeNull()
      expect(clearedState.isAuthenticated).toBe(false)
      expect(clearedState.status).toBe('unauthenticated')
    })
  })

  describe('setAuthStatus', () => {
    it('sets status to authenticated', () => {
      const state = authReducer(undefined, setAuthStatus('authenticated'))
      expect(state.status).toBe('authenticated')
    })

    it('sets status to unauthenticated', () => {
      const state = authReducer(undefined, setAuthStatus('unauthenticated'))
      expect(state.status).toBe('unauthenticated')
    })

    it('sets status to idle', () => {
      const state = authReducer(
        authReducer(undefined, setAuthStatus('authenticated')),
        setAuthStatus('idle'),
      )
      expect(state.status).toBe('idle')
    })
  })
})
