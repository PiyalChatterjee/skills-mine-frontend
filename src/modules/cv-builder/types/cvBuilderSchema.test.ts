import { describe, it, expect } from 'vitest'
import {
  personalDetailsSchema,
  careerHistoryEntrySchema,
  tertiaryEntrySchema,
  secondaryEntrySchema,
  skillEntrySchema,
  cvBuilderSchema,
} from './cvBuilderSchema'

// ─── personalDetailsSchema ────────────────────────────────────────────────────

describe('personalDetailsSchema', () => {
  const validPersonal = {
    fullName: 'Jane Doe',
    race: 'African',
    gender: 'Female',
    disabilityStatus: 'None',
    nationality: 'South African',
    residentialLocation: 'Cape Town',
    currentCompany: '',
    currentPosition: '',
    noticePeriod: '',
  }

  it('accepts valid personal details', () => {
    expect(personalDetailsSchema.safeParse(validPersonal).success).toBe(true)
  })

  it('rejects empty fullName', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, fullName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('fullName'))).toBe(true)
    }
  })

  it('rejects non-alphanumeric fullName', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, fullName: 'Jane@Doe' })
    expect(result.success).toBe(false)
  })

  it('rejects empty race', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, race: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty gender', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, gender: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty disabilityStatus', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, disabilityStatus: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty nationality', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, nationality: '   ' })
    expect(result.success).toBe(false)
  })

  it('rejects empty residentialLocation', () => {
    const result = personalDetailsSchema.safeParse({ ...validPersonal, residentialLocation: '' })
    expect(result.success).toBe(false)
  })

  it('requires currentPosition when currentCompany is provided', () => {
    const result = personalDetailsSchema.safeParse({
      ...validPersonal,
      currentCompany: 'Acme Corp',
      currentPosition: '',
      noticePeriod: '1 Month',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('currentPosition'))).toBe(true)
    }
  })

  it('requires noticePeriod when currentCompany is provided', () => {
    const result = personalDetailsSchema.safeParse({
      ...validPersonal,
      currentCompany: 'Acme Corp',
      currentPosition: 'Engineer',
      noticePeriod: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('noticePeriod'))).toBe(true)
    }
  })

  it('accepts full employment info when all required employment fields are provided', () => {
    const result = personalDetailsSchema.safeParse({
      ...validPersonal,
      currentCompany: 'Acme Corp',
      currentPosition: 'Engineer',
      noticePeriod: '1 Month',
    })
    expect(result.success).toBe(true)
  })
})

// ─── careerHistoryEntrySchema ─────────────────────────────────────────────────

describe('careerHistoryEntrySchema', () => {
  const validEntry = {
    companyName: 'Acme Corp',
    positionHeld: 'Software Engineer',
    startDate: 'January,2020',
    endDate: 'December,2022',
    isCurrentRole: false,
    tasks: ['Built features'],
    projects: ['Project A'],
  }

  it('accepts valid entry', () => {
    expect(careerHistoryEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('accepts current role with empty endDate', () => {
    const result = careerHistoryEntrySchema.safeParse({
      ...validEntry,
      endDate: '',
      isCurrentRole: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty companyName', () => {
    const result = careerHistoryEntrySchema.safeParse({ ...validEntry, companyName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty positionHeld', () => {
    const result = careerHistoryEntrySchema.safeParse({ ...validEntry, positionHeld: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty startDate', () => {
    const result = careerHistoryEntrySchema.safeParse({ ...validEntry, startDate: '' })
    expect(result.success).toBe(false)
  })

  it('rejects startDate with wrong format', () => {
    const result = careerHistoryEntrySchema.safeParse({ ...validEntry, startDate: '01-2020' })
    expect(result.success).toBe(false)
  })

  it('rejects endDate with wrong format when provided', () => {
    const result = careerHistoryEntrySchema.safeParse({
      ...validEntry,
      endDate: '2022-12',
    })
    expect(result.success).toBe(false)
  })

  it('accepts "Present" as endDate', () => {
    const result = careerHistoryEntrySchema.safeParse({ ...validEntry, endDate: 'Present' })
    expect(result.success).toBe(true)
  })

  it('accepts "Current" as endDate (case-insensitive)', () => {
    const result = careerHistoryEntrySchema.safeParse({ ...validEntry, endDate: 'current' })
    expect(result.success).toBe(true)
  })
})

// ─── tertiaryEntrySchema ──────────────────────────────────────────────────────

describe('tertiaryEntrySchema', () => {
  const validEntry = {
    institutionName: 'University of Cape Town',
    degreeOrCertification: 'BSc Computer Science',
    yearCompleted: '2018',
  }

  it('accepts valid tertiary entry', () => {
    expect(tertiaryEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('rejects empty institutionName', () => {
    const result = tertiaryEntrySchema.safeParse({ ...validEntry, institutionName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty degreeOrCertification', () => {
    const result = tertiaryEntrySchema.safeParse({ ...validEntry, degreeOrCertification: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty yearCompleted', () => {
    const result = tertiaryEntrySchema.safeParse({ ...validEntry, yearCompleted: '' })
    expect(result.success).toBe(false)
  })

  it('rejects yearCompleted not matching YYYY pattern', () => {
    const result = tertiaryEntrySchema.safeParse({ ...validEntry, yearCompleted: '18' })
    expect(result.success).toBe(false)
  })
})

// ─── secondaryEntrySchema ─────────────────────────────────────────────────────

describe('secondaryEntrySchema', () => {
  const validEntry = {
    institutionName: 'Cape Town High School',
    highestGradePassed: 'Grade 12',
    yearCompleted: '2010',
  }

  it('accepts valid secondary entry', () => {
    expect(secondaryEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('rejects empty institutionName', () => {
    const result = secondaryEntrySchema.safeParse({ ...validEntry, institutionName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty highestGradePassed', () => {
    const result = secondaryEntrySchema.safeParse({ ...validEntry, highestGradePassed: '' })
    expect(result.success).toBe(false)
  })

  it('rejects non-4-digit yearCompleted', () => {
    const result = secondaryEntrySchema.safeParse({ ...validEntry, yearCompleted: '10' })
    expect(result.success).toBe(false)
  })
})

// ─── skillEntrySchema ─────────────────────────────────────────────────────────

describe('skillEntrySchema', () => {
  it('accepts any string name', () => {
    expect(skillEntrySchema.safeParse({ name: 'React' }).success).toBe(true)
    expect(skillEntrySchema.safeParse({ name: '' }).success).toBe(true)
  })
})

// ─── cvBuilderSchema (composite) ─────────────────────────────────────────────

describe('cvBuilderSchema', () => {
  const validForm = {
    personalDetails: {
      fullName: 'Jane Doe',
      race: 'African',
      gender: 'Female',
      disabilityStatus: 'None',
      nationality: 'South African',
      residentialLocation: 'Cape Town',
      currentCompany: '',
      currentPosition: '',
      noticePeriod: '',
    },
    careerHistory: [],
    skills: [{ name: 'React' }],
    tertiaryEducation: [],
    secondaryEducation: [],
    languages: ['English'],
    otherLanguage: '',
  }

  it('accepts a valid complete form', () => {
    expect(cvBuilderSchema.safeParse(validForm).success).toBe(true)
  })

  it('fails when personalDetails is invalid', () => {
    const result = cvBuilderSchema.safeParse({
      ...validForm,
      personalDetails: { ...validForm.personalDetails, fullName: '' },
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty arrays for optional sections', () => {
    const result = cvBuilderSchema.safeParse({
      ...validForm,
      careerHistory: [],
      tertiaryEducation: [],
      secondaryEducation: [],
      languages: [],
    })
    expect(result.success).toBe(true)
  })
})
