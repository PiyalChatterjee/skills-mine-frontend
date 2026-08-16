import { describe, it, expect } from 'vitest'
import authReducer, {
  setAuthSession,
  clearAuthSession,
  setAuthStatus,
} from './authSlice'
import type { JwtTokens } from '@/types/auth'

const mockTokens: JwtTokens = {
  accessToken: 'access-token-123',
  idToken: 'id-token-789',
  refreshToken: 'refresh-token-456',
}

const mockCurrentUser = {
  userId: 'user-1',
  email: 'test@example.com',
  roles: ['JOB_SEEKER'] as ('JOB_SEEKER' | 'RECRUITER' | 'MANCO' | 'EXCO' | 'ADMIN')[],
  accountStatus: 'ACTIVE',
}

describe('authSlice', () => {
  describe('initial state', () => {
    it('has null currentUser, null token values, isAuthenticated false, and idle status', () => {
      const state = authReducer(undefined, { type: '@@INIT' })
      expect(state.currentUser).toBeNull()
      expect(state.tokens.accessToken).toBeNull()
      expect(state.tokens.idToken).toBeNull()
      expect(state.tokens.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.status).toBe('idle')
    })
  })

  describe('setAuthSession', () => {
    it('sets currentUser and tokens, marks isAuthenticated true and status authenticated', () => {
      const state = authReducer(
        undefined,
        setAuthSession({
          currentUser: mockCurrentUser,
          tokens: {
            accessToken: mockTokens.accessToken,
            idToken: mockTokens.idToken ?? null,
            refreshToken: mockTokens.refreshToken ?? null,
          },
        }),
      )
      expect(state.currentUser).toEqual(mockCurrentUser)
      expect(state.tokens.accessToken).toBe('access-token-123')
      expect(state.tokens.idToken).toBe('id-token-789')
      expect(state.isAuthenticated).toBe(true)
      expect(state.status).toBe('authenticated')
    })
  })

  describe('clearAuthSession', () => {
    it('clears currentUser and tokens, marks isAuthenticated false and status unauthenticated', () => {
      const authenticatedState = authReducer(
        undefined,
        setAuthSession({
          currentUser: mockCurrentUser,
          tokens: {
            accessToken: mockTokens.accessToken,
            idToken: mockTokens.idToken ?? null,
            refreshToken: mockTokens.refreshToken ?? null,
          },
        }),
      )
      const clearedState = authReducer(authenticatedState, clearAuthSession())
      expect(clearedState.currentUser).toBeNull()
      expect(clearedState.tokens.accessToken).toBeNull()
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
