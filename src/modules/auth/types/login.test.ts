import { describe, it, expect } from 'vitest'
import { loginSchema } from './login'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      username: 'user@example.com',
      password: 'secret',
      rememberMe: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts credentials without rememberMe', () => {
    const result = loginSchema.safeParse({
      username: 'user@example.com',
      password: 'pass',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty username', () => {
    const result = loginSchema.safeParse({ username: '', password: 'pass' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => /required/i.test(m) || /invalid/i.test(m))).toBe(true)
    }
  })

  it('rejects non-email username', () => {
    const result = loginSchema.safeParse({
      username: 'not-an-email',
      password: 'pass',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => /email/i.test(m))).toBe(true)
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      username: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages.some((m) => /required/i.test(m))).toBe(true)
    }
  })

  it('trims whitespace from username before validating', () => {
    const result = loginSchema.safeParse({
      username: '  user@example.com  ',
      password: 'pass',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.username).toBe('user@example.com')
    }
  })
})
