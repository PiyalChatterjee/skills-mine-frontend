import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { decodeJwtPayload, isJwtExpired } from './jwt'

// Helper to create a base64url-encoded JWT payload segment
const encodePayload = (payload: Record<string, unknown>): string => {
  const json = JSON.stringify(payload)
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const makeJwt = (payload: Record<string, unknown>): string =>
  `header.${encodePayload(payload)}.signature`

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    const jwt = makeJwt({
      sub: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['JOB_SEEKER'],
      exp: 9999999999,
    })
    const payload = decodeJwtPayload(jwt)
    expect(payload).not.toBeNull()
    expect(payload?.sub).toBe('user-1')
    expect(payload?.email).toBe('test@example.com')
    expect(payload?.roles).toEqual(['JOB_SEEKER'])
  })

  it('returns null for a token with only one part', () => {
    expect(decodeJwtPayload('only-one-part')).toBeNull()
  })

  it('returns null for malformed base64', () => {
    expect(decodeJwtPayload('header.!!!invalid!!!.signature')).toBeNull()
  })

  it('returns null for an empty string', () => {
    expect(decodeJwtPayload('')).toBeNull()
  })

  it('decodes recruiterId when present', () => {
    const jwt = makeJwt({ sub: 'u1', recruiterId: 'r-42' })
    const payload = decodeJwtPayload(jwt)
    expect(payload?.recruiterId).toBe('r-42')
  })

  it('accepts optional fields as undefined when absent', () => {
    const jwt = makeJwt({ sub: 'u1' })
    const payload = decodeJwtPayload(jwt)
    expect(payload?.email).toBeUndefined()
    expect(payload?.name).toBeUndefined()
  })
})

describe('isJwtExpired', () => {
  it('returns false for a token that expires in the future', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600
    const jwt = makeJwt({ sub: 'u1', exp: futureExp })
    expect(isJwtExpired(jwt)).toBe(false)
  })

  it('returns true for a token that expired in the past', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 100
    const jwt = makeJwt({ sub: 'u1', exp: pastExp })
    expect(isJwtExpired(jwt)).toBe(true)
  })

  it('returns true when exp is missing', () => {
    const jwt = makeJwt({ sub: 'u1' })
    expect(isJwtExpired(jwt)).toBe(true)
  })

  it('returns true for a malformed token', () => {
    expect(isJwtExpired('bad-token')).toBe(true)
  })
})
