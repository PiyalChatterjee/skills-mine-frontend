import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isoToMonthName, buildCvBuilderPrefillData, useCvBuilderDone } from './useCvBuilderDone'
import { renderHook, act, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { apiSlice } from '@/store/api/apiSlice'
import candidateReducer from '@/store/slices/candidateSlice'
import notificationReducer from '@/store/slices/notificationSlice'
import type { CandidateProfile } from '@/modules/candidate/types'

// ─── isoToMonthName ───────────────────────────────────────────────────────────

describe('isoToMonthName', () => {
  it('converts a valid ISO YYYY-MM date to Month,YYYY', () => {
    expect(isoToMonthName('2020-01')).toBe('January,2020')
    expect(isoToMonthName('2022-12')).toBe('December,2022')
    expect(isoToMonthName('2019-06')).toBe('June,2019')
  })

  it('returns the original value when format does not match', () => {
    expect(isoToMonthName('not-a-date')).toBe('not-a-date')
    expect(isoToMonthName('')).toBe('')
    expect(isoToMonthName('2020')).toBe('2020')
    expect(isoToMonthName('Present')).toBe('Present')
  })

  it('converts all 12 months correctly', () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
    months.forEach((month, index) => {
      const mm = String(index + 1).padStart(2, '0')
      expect(isoToMonthName(`2021-${mm}`)).toBe(`${month},2021`)
    })
  })
})

// ─── buildCvBuilderPrefillData ────────────────────────────────────────────────

const makeProfile = (overrides: Partial<CandidateProfile> = {}): CandidateProfile => ({
  userId: 'u-1',
  personalDetails: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@test.com',
    mobileNumber: '+27821234567',
    location: 'Cape Town',
    nationality: 'South African',
    idNumber: '',
    eeStatus: 'African',
    profileImageUrl: '',
    thumbnailUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  },
  desiredJob: {
    jobTitle: 'Engineer',
    industry: 'Tech',
    workType: 'Remote',
    employmentType: 'Permanent',
    salaryExpectation: 50000,
    availableFrom: '1 Month',
  },
  education: { certifications: [], highestEarned: 'BSc' },
  experience: [
    {
      company: 'Acme',
      jobTitle: 'Engineer',
      startDate: '2020-01',
      endDate: '2023-06',
      responsibilities: 'Built things',
    },
  ],
  skills: ['React', 'TypeScript'],
  languages: [
    { language: 'English', proficiency: 'Fluent' },
    { language: 'Afrikaans', proficiency: 'Conversational' },
  ],
  ...overrides,
})

describe('buildCvBuilderPrefillData', () => {
  it('returns undefined when profile is undefined', () => {
    expect(buildCvBuilderPrefillData(undefined)).toBeUndefined()
  })

  it('maps fullName from firstName + lastName', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.personalDetails?.fullName).toBe('Jane Doe')
  })

  it('maps nationality and residentialLocation', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.personalDetails?.nationality).toBe('South African')
    expect(result?.personalDetails?.residentialLocation).toBe('Cape Town')
  })

  it('maps race from eeStatus', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.personalDetails?.race).toBe('African')
  })

  it('maps currentCompany and currentPosition from first experience entry', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.personalDetails?.currentCompany).toBe('Acme')
    expect(result?.personalDetails?.currentPosition).toBe('Engineer')
  })

  it('falls back to desiredJob.jobTitle when no experience', () => {
    const profile = makeProfile({ experience: [] })
    const result = buildCvBuilderPrefillData(profile)
    expect(result?.personalDetails?.currentPosition).toBe('Engineer')
    expect(result?.personalDetails?.currentCompany).toBe('')
  })

  it('maps noticePeriod from desiredJob.availableFrom', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.personalDetails?.noticePeriod).toBe('1 Month')
  })

  it('maps career history with ISO dates converted to Month,YYYY', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.careerHistory).toBeUndefined()
  })

  it('marks isCurrentRole true for entries with "present" endDate', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.careerHistory).toBeUndefined()
  })

  it('maps skills to name entries', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.skills).toBeUndefined()
  })

  it('maps known languages', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.languages).toBeUndefined()
  })

  it('maps unknown language to "Other" and sets otherLanguage', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.languages).toBeUndefined()
    expect(result?.otherLanguage).toBeUndefined()
  })

  it('maps education entries to tertiary education', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.tertiaryEducation).toBeUndefined()
  })

  it('sets secondaryEducation to empty array', () => {
    const result = buildCvBuilderPrefillData(makeProfile())
    expect(result?.secondaryEducation).toBeUndefined()
  })

  it('handles profile with empty skills array', () => {
    const result = buildCvBuilderPrefillData(makeProfile({ skills: [] }))
    expect(result?.skills).toBeUndefined()
  })

  it('handles profile with empty languages array', () => {
    const result = buildCvBuilderPrefillData(makeProfile({ languages: [] }))
    expect(result?.languages).toBeUndefined()
    expect(result?.otherLanguage).toBeUndefined()
  })

  it('handles null-ish experience entries gracefully', () => {
    const profile = makeProfile({
      experience: [
        { company: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' },
      ],
    })
    const result = buildCvBuilderPrefillData(profile)
    expect(result?.personalDetails?.currentCompany).toBe('')
    expect(result?.personalDetails?.currentPosition).toBe('')
  })
})

// ─── useCvBuilderDone hook ────────────────────────────────────────────────────

const mockSaveBuildMyCv = vi.hoisted(() => vi.fn())
const mockUpdateBuildMyCv = vi.hoisted(() => vi.fn())
const mockUploadResumeDocument = vi.hoisted(() => vi.fn())
const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('@/store/api/apiSlice', async () => {
  const actual = await vi.importActual<typeof import('@/store/api/apiSlice')>(
    '@/store/api/apiSlice',
  )
  return {
    ...actual,
    useSaveBuildMyCvMutation: () => [
      mockSaveBuildMyCv,
      { isLoading: false },
    ],
    useUpdateBuildMyCvMutation: () => [
      mockUpdateBuildMyCv,
      { isLoading: false },
    ],
    useUploadCvResumeDocumentMutation: () => [mockUploadResumeDocument, { isLoading: false }],
  }
})

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/app/auth/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('@/app/auth/AuthContext')>(
    '@/app/auth/AuthContext',
  )
  return {
    ...actual,
    useAuth: () => ({ user: { userId: 'u-1', candidateId: 'c-1' } }),
  }
})

const makeTestStore = () =>
  configureStore({
    reducer: {
      candidate: candidateReducer,
      notification: notificationReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
  })

const makeWrapper = (store: ReturnType<typeof makeTestStore>) =>
  ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <Provider store={store}>{children}</Provider>
    </MemoryRouter>
  )

const defaultFormValues = {
  personalDetails: {
    fullName: 'Jane Doe',
    race: 'African',
    gender: 'Female',
    disabilityStatus: 'None',
    nationality: 'South African',
    residentialLocation: 'Cape Town',
    currentCompany: 'Acme',
    currentPosition: 'Engineer',
    noticePeriod: '1 Month',
  },
  careerHistory: [
    {
      companyName: 'Acme',
      positionHeld: 'Engineer',
      startDate: 'January,2020',
      endDate: 'June,2023',
      isCurrentRole: false,
      tasks: ['Built features'],
      projects: [],
    },
  ],
  skills: [{ name: 'React' }],
  tertiaryEducation: [
    { institutionName: 'UCT', degreeOrCertification: 'BSc', yearCompleted: '2018' },
  ],
  secondaryEducation: [],
  languages: ['English'],
  otherLanguage: '',
}

describe('useCvBuilderDone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUploadResumeDocument.mockReturnValue({ unwrap: () => Promise.resolve({}) })
  })

  it('calls save mutation when buildMyCvExists is false', async () => {
    const successResult = { lastModified: '2024-01-01' }
    mockSaveBuildMyCv.mockReturnValue({ unwrap: () => Promise.resolve(successResult) })
    const store = makeTestStore()
    const { result } = renderHook(
      () =>
        useCvBuilderDone({
          getFormValues: () => defaultFormValues,
          selectedLanguageEntries: ['English'],
          buildMyCvExists: false,
        }),
      { wrapper: makeWrapper(store) },
    )
    await act(async () => {
      await result.current.handleDone()
    })
    expect(mockSaveBuildMyCv).toHaveBeenCalled()
    expect(mockUploadResumeDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        candidateId: 'c-1',
        fileName: expect.stringMatching(/\.pdf$/),
      }),
    )
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('calls update mutation when buildMyCvExists is true', async () => {
    const successResult = { lastModified: '2024-06-01' }
    mockUpdateBuildMyCv.mockReturnValue({ unwrap: () => Promise.resolve(successResult) })
    const store = makeTestStore()
    const { result } = renderHook(
      () =>
        useCvBuilderDone({
          getFormValues: () => defaultFormValues,
          selectedLanguageEntries: ['English'],
          buildMyCvExists: true,
        }),
      { wrapper: makeWrapper(store) },
    )
    await act(async () => {
      await result.current.handleDone()
    })
    expect(mockUpdateBuildMyCv).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalled()
  })

  it('dispatches error notification when save fails', async () => {
    mockSaveBuildMyCv.mockReturnValue({
      unwrap: () => Promise.reject({ message: 'Save failed' }),
    })
    const store = makeTestStore()
    const { result } = renderHook(
      () =>
        useCvBuilderDone({
          getFormValues: () => defaultFormValues,
          selectedLanguageEntries: [],
          buildMyCvExists: false,
        }),
      { wrapper: makeWrapper(store) },
    )
    await act(async () => {
      await result.current.handleDone()
    })
    await waitFor(() => {
      const notifications = store.getState().notification.items
      expect(notifications.some((n) => n.level === 'error')).toBe(true)
    })
  })

  it('returns isSavingCandidateProfile as false when not loading', () => {
    const store = makeTestStore()
    const { result } = renderHook(
      () =>
        useCvBuilderDone({
          getFormValues: () => defaultFormValues,
          selectedLanguageEntries: [],
          buildMyCvExists: false,
        }),
      { wrapper: makeWrapper(store) },
    )
    expect(result.current.isSavingCandidateProfile).toBe(false)
  })
})
