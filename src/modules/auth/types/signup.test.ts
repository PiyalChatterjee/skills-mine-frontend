import { describe, it, expect } from 'vitest'
import { inviteSignupSchema, recruiterInviteSignupSchema } from './signup'

const validPayload = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  staffNumber: 'SM-REC-001',
  mobileNumber: '0821234567',
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

  it('rejects names containing only special characters', () => {
    expect(
      inviteSignupSchema.safeParse({ ...validPayload, firstName: '!!!' }).success,
    ).toBe(false)
    expect(
      inviteSignupSchema.safeParse({ ...validPayload, lastName: '---' }).success,
    ).toBe(false)
  })

  it('accepts names with spaces, apostrophes, and hyphens', () => {
    expect(
      inviteSignupSchema.safeParse({
        ...validPayload,
        firstName: 'Mary Jane',
        lastName: "O'Neil-Smith",
      }).success,
    ).toBe(true)
  })

  it('allows an empty staffNumber for self-service candidate registration', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, staffNumber: '' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, email: 'bad-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true)
    }
  })

  it('accepts common special characters in the email name', () => {
    expect(
      inviteSignupSchema.safeParse({
        ...validPayload,
        email: 'jane.doe+work_2%3@example.com',
      }).success,
    ).toBe(true)
  })

  it('rejects unsupported characters in the email name', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      email: 'jane(doe)@example.com',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('email'))).toBe(true)
    }
  })

  it('rejects phone number that is not exactly 10 digits', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      mobileNumber: '0821234',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('mobileNumber'))).toBe(true)
    }
  })

  it('rejects a phone number containing only zeros', () => {
    const result = inviteSignupSchema.safeParse({
      ...validPayload,
      mobileNumber: '0000000000',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('mobileNumber'))).toBe(true)
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

  it('accepts a 10-digit phone number and rejects a 9-digit one', () => {
    expect(inviteSignupSchema.safeParse({ ...validPayload, mobileNumber: '0821234567' }).success).toBe(true)
    expect(inviteSignupSchema.safeParse({ ...validPayload, mobileNumber: '821234567' }).success).toBe(false)
  })

  it('rejects empty email', () => {
    const result = inviteSignupSchema.safeParse({ ...validPayload, email: '' })
    expect(result.success).toBe(false)
  })
})

describe('recruiterInviteSignupSchema', () => {
  it('accepts a fully valid payload', () => {
    expect(recruiterInviteSignupSchema.safeParse(validPayload).success).toBe(true)
  })

  it('rejects an empty staffNumber, unlike the self-service schema', () => {
    const result = recruiterInviteSignupSchema.safeParse({ ...validPayload, staffNumber: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('staffNumber'))).toBe(true)
    }
  })
})
