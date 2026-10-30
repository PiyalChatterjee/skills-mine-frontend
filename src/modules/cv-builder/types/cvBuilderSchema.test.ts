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

  it.each(['race', 'gender', 'disabilityStatus', 'residentialLocation'])(
    'rejects whitespace-only %s',
    (field) => {
      const result = personalDetailsSchema.safeParse({ ...validPersonal, [field]: '   ' })
      expect(result.success).toBe(false)
    },
  )

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

  it('allows empty career history when current company is blank', () => {
    const result = cvBuilderSchema.safeParse({
      personalDetails: validPersonal,
      careerHistory: [],
      skills: [{ name: 'React' }],
      tertiaryEducation: [{
        institutionName: 'University',
        degreeOrCertification: 'BSc',
        yearCompleted: '2020',
      }],
      secondaryEducation: [{
        institutionName: 'School',
        highestGradePassed: 'Grade 12',
        yearCompleted: '2016',
      }],
      languages: ['English'],
      otherLanguage: '',
    })

    expect(result.success).toBe(true)
  })

  it('allows the untouched blank position placeholder when current company is blank', () => {
    const result = cvBuilderSchema.safeParse({
      personalDetails: validPersonal,
      careerHistory: [{
        companyName: '',
        positionHeld: '',
        startDate: '',
        endDate: '',
        isCurrentRole: false,
        tasks: [''],
        projects: [''],
      }],
      skills: [{ name: 'React' }],
      tertiaryEducation: [{
        institutionName: 'University',
        degreeOrCertification: 'BSc',
        yearCompleted: '2020',
      }],
      secondaryEducation: [{
        institutionName: 'School',
        highestGradePassed: 'Grade 12',
        yearCompleted: '2016',
      }],
      languages: ['English'],
      otherLanguage: '',
    })

    expect(result.success).toBe(true)
  })

  it('does not require partially filled career history when current company is blank', () => {
    const result = cvBuilderSchema.safeParse({
      personalDetails: validPersonal,
      careerHistory: [{
        companyName: 'Acme Corp',
        positionHeld: '',
        startDate: '',
        endDate: '',
        isCurrentRole: false,
        tasks: ['Built things'],
        projects: [''],
      }],
      skills: [{ name: 'React' }],
      tertiaryEducation: [{
        institutionName: 'University',
        degreeOrCertification: 'BSc',
        yearCompleted: '2020',
      }],
      secondaryEducation: [{
        institutionName: 'School',
        highestGradePassed: 'Grade 12',
        yearCompleted: '2016',
      }],
      languages: ['English'],
      otherLanguage: '',
    })

    expect(result.success).toBe(true)
  })

  it('requires career entry fields when current company is provided', () => {
    const result = cvBuilderSchema.safeParse({
      personalDetails: {
        ...validPersonal,
        currentCompany: 'Acme Corp',
        currentPosition: 'Engineer',
        noticePeriod: '1 Month',
      },
      careerHistory: [{
        companyName: '',
        positionHeld: '',
        startDate: '',
        endDate: '',
        isCurrentRole: false,
        tasks: [''],
        projects: [''],
      }],
      skills: [{ name: 'React' }],
      tertiaryEducation: [{
        institutionName: 'University',
        degreeOrCertification: 'BSc',
        yearCompleted: '2020',
      }],
      secondaryEducation: [{
        institutionName: 'School',
        highestGradePassed: 'Grade 12',
        yearCompleted: '2016',
      }],
      languages: ['English'],
      otherLanguage: '',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'careerHistory.0.companyName')).toBe(true)
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'careerHistory.0.positionHeld')).toBe(true)
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'careerHistory.0.startDate')).toBe(true)
    }
  })

  it('requires career history when current company is provided', () => {
    const result = cvBuilderSchema.safeParse({
      personalDetails: {
        ...validPersonal,
        currentCompany: 'Acme Corp',
        currentPosition: 'Engineer',
        noticePeriod: '1 Month',
      },
      careerHistory: [],
      skills: [{ name: 'React' }],
      tertiaryEducation: [{
        institutionName: 'University',
        degreeOrCertification: 'BSc',
        yearCompleted: '2020',
      }],
      secondaryEducation: [{
        institutionName: 'School',
        highestGradePassed: 'Grade 12',
        yearCompleted: '2016',
      }],
      languages: ['English'],
      otherLanguage: '',
    })

    expect(result.success).toBe(false)
  })

  it('accepts the populated CV builder values used by the review screen', () => {
    const result = cvBuilderSchema.safeParse({
      personalDetails: {
        fullName: 'John Doe',
        race: 'African',
        gender: 'Male',
        disabilityStatus: 'None',
        nationality: 'African',
        residentialLocation: 'Johannesburg',
        currentCompany: 'Accenture',
        currentPosition: 'App developer',
        noticePeriod: '1_MONTH',
      },
      careerHistory: [{
        companyName: 'Accenture',
        positionHeld: 'App Developer',
        startDate: 'January 2022',
        endDate: '',
        isCurrentRole: true,
        tasks: ['Lead frontend development for enterprise clients using React and Node.js.'],
        projects: [''],
      }],
      skills: [{ name: 'Node.js' }],
      tertiaryEducation: [{
        institutionName: 'University of Whitesand',
        degreeOrCertification: 'BE in Computer Science',
        yearCompleted: '2025',
      }],
      secondaryEducation: [{
        institutionName: 'Northcliff High School',
        highestGradePassed: 'Grade 12',
        yearCompleted: '2021',
      }],
      languages: ['English'],
      otherLanguage: '',
    })

    expect(result.success).toBe(true)
  })
})

// ─── careerHistoryEntrySchema ─────────────────────────────────────────────────

describe('careerHistoryEntrySchema', () => {
  const validEntry = {
    companyName: 'Acme Corp',
    positionHeld: 'Software Engineer',
    startDate: 'January 2020',
    endDate: 'December 2022',
    isCurrentRole: false,
    tasks: ['Built features'],
    projects: ['Project A'],
  }

  it('accepts valid entry', () => {
    expect(careerHistoryEntrySchema.safeParse(validEntry).success).toBe(true)
  })

  it('rejects an end date earlier than the start date', () => {
    const result = careerHistoryEntrySchema.safeParse({
      ...validEntry,
      startDate: 'January 2021',
      endDate: 'December 2013',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('startDate'))).toBe(true)
    }
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

  it('rejects whitespace-only required text fields', () => {
    expect(tertiaryEntrySchema.safeParse({ ...validEntry, institutionName: '   ' }).success).toBe(false)
    expect(tertiaryEntrySchema.safeParse({ ...validEntry, degreeOrCertification: '   ' }).success).toBe(false)
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

  it('rejects 0000 as yearCompleted', () => {
    const result = tertiaryEntrySchema.safeParse({ ...validEntry, yearCompleted: '0000' })
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

  it('rejects whitespace-only required text fields', () => {
    expect(secondaryEntrySchema.safeParse({ ...validEntry, institutionName: '   ' }).success).toBe(false)
    expect(secondaryEntrySchema.safeParse({ ...validEntry, highestGradePassed: '   ' }).success).toBe(false)
  })

  it('rejects empty highestGradePassed', () => {
    const result = secondaryEntrySchema.safeParse({ ...validEntry, highestGradePassed: '' })
    expect(result.success).toBe(false)
  })

  it('rejects non-4-digit yearCompleted', () => {
    const result = secondaryEntrySchema.safeParse({ ...validEntry, yearCompleted: '10' })
    expect(result.success).toBe(false)
  })

  it('rejects 0000 as yearCompleted', () => {
    const result = secondaryEntrySchema.safeParse({ ...validEntry, yearCompleted: '0000' })
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
