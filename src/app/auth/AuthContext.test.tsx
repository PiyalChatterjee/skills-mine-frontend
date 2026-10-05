import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from './AuthContext'
import type { AuthUser, JwtTokens } from '@/types/auth'

const mocks = vi.hoisted(() => ({
  authEventsOnUnauthorized: vi.fn(),
  clearAuth: vi.fn(),
  clearAuthSession: vi.fn(() => ({ type: 'auth/clear' })),
  clearCandidateState: vi.fn(() => ({ type: 'candidate/clear' })),
  dispatch: vi.fn(),
  getTokens: vi.fn(),
  getUser: vi.fn(),
  isJwtExpired: vi.fn(),
  resetApiState: vi.fn(() => ({ type: 'api/reset' })),
  unauthorizedHandler: null as (() => void) | null,
  setTokens: vi.fn(),
  setUser: vi.fn(),
}))

vi.mock('./tokenStorage', () => ({
  tokenStorage: {
    clearAuth: mocks.clearAuth,
    getTokens: mocks.getTokens,
    getUser: mocks.getUser,
    setTokens: mocks.setTokens,
    setUser: mocks.setUser,
  },
}))

vi.mock('./jwt', () => ({
  isJwtExpired: mocks.isJwtExpired,
}))

vi.mock('./authEvents', () => ({
  authEvents: {
    onUnauthorized: (handler: () => void) => {
      mocks.authEventsOnUnauthorized(handler)
      mocks.unauthorizedHandler = handler
    },
  },
}))

vi.mock('@/store', () => ({
  store: { dispatch: mocks.dispatch },
}))

vi.mock('@/store/api/apiSlice', () => ({
  apiSlice: { util: { resetApiState: mocks.resetApiState } },
}))

vi.mock('@/store/slices/authSlice', () => ({
  clearAuthSession: mocks.clearAuthSession,
}))

vi.mock('@/store/slices/candidateSlice', () => ({
  clearCandidateState: mocks.clearCandidateState,
}))

const tokens: JwtTokens = {
  accessToken: 'access-token',
  idToken: 'id-token',
  refreshToken: 'refresh-token',
}

const user: AuthUser = {
  id: 'user-1',
  userId: 'user-1',
  email: 'jane@example.com',
  firstName: 'Jane',
  lastName: 'Doe',
  displayName: 'Jane Doe',
  role: 'JOB_SEEKER',
  roles: ['JOB_SEEKER'],
  permissions: ['VIEW_JOBS', 'APPLY_JOB'],
}

const Probe = () => {
  const auth = useAuth()

  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="display-name">{auth.user?.displayName ?? 'none'}</span>
      <span data-testid="first-login">{String(auth.isFirstLogin)}</span>
      <span data-testid="job-seeker-role">{String(auth.hasRole(['JOB_SEEKER']))}</span>
      <span data-testid="apply-permission">{String(auth.hasPermission(['APPLY_JOB']))}</span>
      <button type="button" onClick={() => auth.login({ user, tokens, isFirstLogin: true })}>
        Login
      </button>
      <button type="button" onClick={auth.logout}>
        Logout
      </button>
    </div>
  )
}

const renderAuth = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.unauthorizedHandler = null
    mocks.getTokens.mockReturnValue(null)
    mocks.getUser.mockReturnValue(null)
    mocks.isJwtExpired.mockReturnValue(false)
  })

  it('starts unauthenticated when storage has no complete session', () => {
    renderAuth()

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('display-name')).toHaveTextContent('none')
    expect(mocks.clearAuth).toHaveBeenCalled()
  })

  it('restores an unexpired persisted session', async () => {
    mocks.getTokens.mockReturnValue(tokens)
    mocks.getUser.mockReturnValue(user)

    renderAuth()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('display-name')).toHaveTextContent('Jane Doe')
    expect(mocks.isJwtExpired).toHaveBeenCalledWith('access-token')
  })

  it('clears a session when the persisted token is expired', () => {
    mocks.getTokens.mockReturnValue(tokens)
    mocks.getUser.mockReturnValue(user)
    mocks.isJwtExpired.mockReturnValue(true)

    renderAuth()

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(mocks.clearAuth).toHaveBeenCalled()
  })

  it('persists login state and exposes role and permission checks', async () => {
    renderAuth()

    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })
    expect(screen.getByTestId('display-name')).toHaveTextContent('Jane Doe')
    expect(screen.getByTestId('first-login')).toHaveTextContent('true')
    expect(screen.getByTestId('job-seeker-role')).toHaveTextContent('true')
    expect(screen.getByTestId('apply-permission')).toHaveTextContent('true')
    expect(mocks.setTokens).toHaveBeenCalledWith(tokens)
    expect(mocks.setUser).toHaveBeenCalledWith(user)
  })

  it('clears all session state on logout and unauthorized events', async () => {
    renderAuth()
    fireEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    mocks.unauthorizedHandler?.()

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'api/reset' })
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'auth/clear' })
    expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'candidate/clear' })

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(mocks.clearAuth).toHaveBeenCalled()
  })
})
