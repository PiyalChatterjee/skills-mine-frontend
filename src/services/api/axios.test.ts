import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  authEventsEmitUnauthorized: vi.fn(),
  clearAuth: vi.fn(),
  create: vi.fn(),
  getTokens: vi.fn(),
  requestHandlers: [] as Array<(config: unknown) => unknown>,
  responseErrorHandlers: [] as Array<(error: unknown) => unknown>,
}))

vi.mock('axios', () => ({
  default: {
    create: mocks.create.mockImplementation(() => {
      const client = {
        interceptors: {
          request: {
            use: (handler: (config: unknown) => unknown) => {
              mocks.requestHandlers.push(handler)
            },
          },
          response: {
            use: (
              _successHandler: (response: unknown) => unknown,
              errorHandler: (error: unknown) => unknown,
            ) => {
              mocks.responseErrorHandlers.push(errorHandler)
            },
          },
        },
      }
      return client
    }),
  },
}))

vi.mock('@/app/auth/authEvents', () => ({
  authEvents: {
    emitUnauthorized: mocks.authEventsEmitUnauthorized,
  },
}))

vi.mock('@/app/auth/tokenStorage', () => ({
  tokenStorage: {
    clearAuth: mocks.clearAuth,
    getTokens: mocks.getTokens,
  },
}))

import './axios'

describe('API client interceptors', () => {
  const getRequestHandler = () => mocks.requestHandlers[0]
  const getResponseErrorHandler = () => mocks.responseErrorHandlers[0]

  beforeEach(() => {
    mocks.authEventsEmitUnauthorized.mockClear()
    mocks.clearAuth.mockClear()
    mocks.getTokens.mockReturnValue({ accessToken: 'access-token' })
  })

  it('registers one request and response interceptor for each service client', () => {
    expect(mocks.create).toHaveBeenCalledTimes(9)
    expect(mocks.requestHandlers).toHaveLength(9)
    expect(mocks.responseErrorHandlers).toHaveLength(9)
  })

  it('adds the bearer token to authenticated requests', () => {
    const config = { headers: {} }

    const result = getRequestHandler()(config)

    expect(result).toEqual({ headers: { Authorization: 'Bearer access-token' } })
  })

  it('does not add an authorization header without a token', () => {
    mocks.getTokens.mockReturnValue(null)
    const config = { headers: {} }

    const result = getRequestHandler()(config)

    expect(result).toEqual({ headers: {} })
  })

  it('clears active sessions and emits unauthorized on a 401 response', async () => {
    const error = {
      response: { status: 401 },
      config: {},
    }

    await expect(Promise.resolve(getResponseErrorHandler()(error))).rejects.toBe(error)

    expect(mocks.clearAuth).toHaveBeenCalledTimes(1)
    expect(mocks.authEventsEmitUnauthorized).toHaveBeenCalledTimes(1)
  })

  it('does not clear the session for an opted-out 401 request', async () => {
    const error = {
      response: { status: 401 },
      config: { skipUnauthorizedRedirect: true },
    }

    await expect(Promise.resolve(getResponseErrorHandler()(error))).rejects.toBe(error)

    expect(mocks.clearAuth).not.toHaveBeenCalled()
    expect(mocks.authEventsEmitUnauthorized).not.toHaveBeenCalled()
  })

  it('does not clear the session for non-401 errors', async () => {
    const error = {
      response: { status: 500 },
      config: {},
    }

    await expect(Promise.resolve(getResponseErrorHandler()(error))).rejects.toBe(error)

    expect(mocks.clearAuth).not.toHaveBeenCalled()
    expect(mocks.authEventsEmitUnauthorized).not.toHaveBeenCalled()
  })

  it('normalizes known backend codes without replacing the error or response', async () => {
    const data = { code: 'EMAIL_ALREADY_REGISTERED', message: 'Provisioning conflict' }
    const error = {
      message: 'Request failed with status code 409',
      code: 'ERR_BAD_REQUEST',
      response: { status: 409, data },
      config: {},
    }
    await expect(Promise.resolve(getResponseErrorHandler()(error))).rejects.toBe(error)
    expect(error.message).toBe('This email address is already registered. Please sign in or use a different email address.')
    expect(error.code).toBe('ERR_BAD_REQUEST')
    expect(error.response.data).toBe(data)
  })

  it('preserves messages for errors without a known backend code', async () => {
    const error = { message: 'Network timeout', config: {} }
    await expect(Promise.resolve(getResponseErrorHandler()(error))).rejects.toBe(error)
    expect(error.message).toBe('Network timeout')
  })
})
