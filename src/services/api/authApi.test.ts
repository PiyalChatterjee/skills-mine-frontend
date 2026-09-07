import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authApi, mapLoginResponseToSession } from './authApi'

const mockPost = vi.hoisted(() => vi.fn())
const mockGet = vi.hoisted(() => vi.fn())

vi.mock('@/services/api/axios', () => ({
  authApiClient: { post: mockPost, get: mockGet },
  unwrapResponseData: async (promise: Promise<unknown>) => (await promise as { data: unknown }).data,
}))

vi.mock('@/services/api/endpoints', () => ({
  apiEndpoints: {
    auth: {
      login: '/api/auth-service/v1/auth/login',
      candidateRegister: '/api/auth-service/v1/auth/candidates/register',
      candidateVisitorConversion: '/api/auth-service/v1/auth/candidates/register/visitor/conversion',
      googleRegister: '/api/auth-service/v1/auth/candidates/register-google',
      staffRegister: '/api/auth-service/v1/auth/staff/register',
      forgotPassword: '/api/auth-service/v1/auth/forgot-password',
      resetPassword: '/api/auth-service/v1/auth/reset-password',
      logout: '/api/auth-service/v1/auth/logout',
      me: '/api/auth-service/v1/users/me',
      validate: '/api/auth-service/v1/users/validate',
    },
    staff: { profiles: '/api/auth-service/v1/staff/profiles' },
    admin: { staffInvitationsSend: '/api/auth-service/v1/admin/staff-invitations/send' },
  },
}))

vi.mock('@/app/auth/jwt', () => ({ decodeJwtPayload: () => ({ userId: 'user-1', email: 'test@example.com', firstName: 'Test', lastName: 'User', roles: ['JOB_SEEKER'] }) }))
vi.mock('@/app/auth/tokenStorage', () => ({ tokenStorage: { setTokens: vi.fn(), clearAuth: vi.fn() } }))

const loginResponse = { accessToken: 'access-token', idToken: 'id-token', refreshToken: 'refresh-token', expiresIn: 3600, tokenType: 'Bearer', isFirstLogin: false }

describe('authApi v3', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the v3 login request and flat token response', async () => {
    mockPost.mockResolvedValue({ data: loginResponse })
    await expect(authApi.login({ email: 'test@example.com', password: 'pass' })).resolves.toEqual(loginResponse)
    expect(mockPost).toHaveBeenCalledWith('/api/auth-service/v1/auth/login', { email: 'test@example.com', password: 'pass' })
  })

  it('uses v3 candidate, visitor-conversion, Google, and staff registration routes', async () => {
    mockPost.mockResolvedValue({ data: {} })
    await authApi.candidateRegister({ firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', mobileNumber: '0821234567', password: 'Password1!' })
    await authApi.candidateRegisterFromVisitor({ visitorId: 'visitor-1', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', mobileNumber: '0821234567', password: 'Password1!' })
    await authApi.exchangeGoogleToken({ idToken: 'google-id-token' })
    await authApi.staffRegister({ invitationToken: 'invite-1', staffNumber: 'SM-001', firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', password: 'Password1!' })
    expect(mockPost.mock.calls.map(([url]) => url)).toEqual([
      '/api/auth-service/v1/auth/candidates/register',
      '/api/auth-service/v1/auth/candidates/register/visitor/conversion',
      '/api/auth-service/v1/auth/candidates/register-google',
      '/api/auth-service/v1/auth/staff/register',
    ])
  })

  it('uses the unified v3 reset-password route for recovery and password changes', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Password has been reset successfully.' } })
    await authApi.resetPassword({ email: 'test@example.com', confirmationCode: '123456', newPassword: 'Password1!' })
    await authApi.changePassword({ currentPassword: 'OldPassword1!', newPassword: 'Password1!' })
    expect(mockPost.mock.calls.map(([url]) => url)).toEqual([
      '/api/auth-service/v1/auth/reset-password',
      '/api/auth-service/v1/auth/reset-password',
    ])
  })

  it('maps the flat login response after reading the v3 current-user endpoint', async () => {
    mockGet.mockResolvedValue({ data: { userId: 'user-1', email: 'test@example.com', provider: 'LOCAL', roles: ['JOB_SEEKER'], accountStatus: 'ACTIVE' } })
    const session = await mapLoginResponseToSession(loginResponse)
    expect(mockGet).toHaveBeenCalledWith('/api/auth-service/v1/users/me')
    expect(session.user.userId).toBe('user-1')
    expect(session.tokens.accessToken).toBe('access-token')
  })
})