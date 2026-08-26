import { describe, it, expect } from 'vitest'
import { inviteSignupSchema } from './signup'

const validPayload = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  staffNumber: 'SM-REC-001',
  mobileNumber: '+27821234567',
  password: 'Password1!',
  confirmPassword: 'Password1!',
  acceptTerms: true,
}

describe('inviteSignupSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(inviteSignupSchema.safeParse(validPayload).success).toBe(true)
  })

  it('rejects empty firstName', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, firstName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('firstName'))).toBe(true)
    }
  })

  it('rejects empty lastName', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, lastName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty staffNumber', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, staffNumber: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('staffNumber'))).toBe(true)
    }
  })

  it('rejects invalid email', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, email: 'bad-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true)
    }
  })

  it('rejects phone number without international prefix', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      mobileNumber: '0821234567',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('mobileNumber'))).toBe(true)
    }
  })

  it('rejects password shorter than 8 characters', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      password: 'short',
      confirmPassword: 'short',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('password'))).toBe(true)
    }
  })

  it('rejects when passwords do not match', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      confirmPassword: 'DifferentPass1',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path.includes('confirmPassword')),
      ).toBe(true)
    }
  })

  it('rejects when acceptTerms is false', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      acceptTerms: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('acceptTerms'))).toBe(true)
    }
  })

  it('accepts phone numbers of varying valid lengths', () => {
    expect(
      inviteSignupSchema.safeParse({ ...validPayload, mobileNumber: '+12345678901234' }).success,
    ).toBe(true)
  })

  it('rejects empty email', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, email: '' })
    expect(result.success).toBe(false)
  })
})
