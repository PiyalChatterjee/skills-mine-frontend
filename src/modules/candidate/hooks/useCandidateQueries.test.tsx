import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import type { ReactNode } from 'react'
import { apiSlice } from '@/store/api/apiSlice'
import candidateReducer from '@/store/slices/candidateSlice'
import {
  useCandidateProfileQuery,
  useCandidateDashboardQuery,
  useUserProfile,
  useSkillsSearch,
  useBuildMyCvQuery,
  useSaveBuildMyCv,
  useUpdateBuildMyCv,
  useUpdateCandidateProfileMutation,
  useSaveJob,
} from './useCandidateQueries'

// Mock underlying service calls
const mockGetById = vi.fn()
const mockGetDashboard = vi.fn()
const mockGetUserProfile = vi.fn()
const mockSearchSkills = vi.fn()
const mockGetBuildMyCv = vi.fn()
const mockSaveBuildMyCv = vi.fn()
const mockUpdateBuildMyCv = vi.fn()
const mockUpdateById = vi.fn()
const mockUpdateUserProfile = vi.fn()
const mockSaveJob = vi.fn()

vi.mock('@/services/api', () => ({
  candidateApi: {
    getById: (...args: unknown[]) => mockGetById(...args),
    getDashboard: (...args: unknown[]) => mockGetDashboard(...args),
    getUserProfile: (...args: unknown[]) => mockGetUserProfile(...args),
    searchSkills: (...args: unknown[]) => mockSearchSkills(...args),
    getBuildMyCv: (...args: unknown[]) => mockGetBuildMyCv(...args),
    saveBuildMyCv: (...args: unknown[]) => mockSaveBuildMyCv(...args),
    updateBuildMyCv: (...args: unknown[]) => mockUpdateBuildMyCv(...args),
    updateById: (...args: unknown[]) => mockUpdateById(...args),
    updateUserProfile: (...args: unknown[]) => mockUpdateUserProfile(...args),
    saveJob: (...args: unknown[]) => mockSaveJob(...args),
    getSavedJobs: vi.fn().mockResolvedValue({ data: { candidateId: 'c-1', jobs: [], total: 0 } }),
  },
  jobsApi: {
    list: vi.fn().mockResolvedValue({ data: [] }),
    save: vi.fn().mockResolvedValue({ success: true }),
  },
}))

// Candidate hooks resolve their resource id from the auth session.
vi.mock('@/app/auth/AuthContext', async () => {
  const actual = await vi.importActual<typeof import('@/app/auth/AuthContext')>(
    '@/app/auth/AuthContext',
  )
  return {
    ...actual,
    useAuth: () => ({ user: { userId: 'u-1' } }),
  }
})

const makeTestStore = () =>
  configureStore({
    reducer: {
      candidate: candidateReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefault) => getDefault().concat(apiSlice.middleware),
  })

const makeWrapper = (store: ReturnType<typeof makeTestStore>) => {
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
}

const mockProfile = {
  userId: 'u-1',
  personalDetails: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@test.com',
    mobileNumber: '+27821234567',
    location: 'Cape Town',
    nationality: 'South African',
    idNumber: '',
    eeStatus: '',
    profileImageUrl: '',
    thumbnailUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  },
  desiredJob: { jobTitle: 'Engineer', industry: 'Tech', workType: 'Remote', employmentType: 'Permanent', salaryExpectation: 50000, availableFrom: '' },
  education: [],
  experience: [],
  skills: ['React'],
  languages: [],
}

describe('useCandidateProfileQuery', () => {
  it('skips when userId is not provided', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useCandidateProfileQuery(undefined), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })

  it('fetches profile when userId is provided', async () => {
    mockGetById.mockResolvedValue(mockProfile)
    const store = makeTestStore()
    const { result } = renderHook(() => useCandidateProfileQuery('u-1'), {
      wrapper: makeWrapper(store),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.userId).toBe('u-1')
  })

  it('skips when enabled=false', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useCandidateProfileQuery('c-1', 'u-1', false), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useCandidateDashboardQuery', () => {
  it('skips when userId is not provided', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useCandidateDashboardQuery(undefined), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })

  it('fetches dashboard data', async () => {
    const dashData = { summary: {}, applications: [], activity: {} }
    mockGetDashboard.mockResolvedValue({ data: dashData })
    const store = makeTestStore()
    const { result } = renderHook(() => useCandidateDashboardQuery(true), {
      wrapper: makeWrapper(store),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useUserProfile', () => {
  beforeEach(() => vi.clearAllMocks())

  it('dispatches setSavedJobs when profile data arrives', async () => {
    const userProfileData = { userId: 'u-1', savedJobs: ['j1'] }
    mockGetUserProfile.mockResolvedValue(userProfileData)
    const store = makeTestStore()
    renderHook(() => useUserProfile('u-1'), { wrapper: makeWrapper(store) })
    await waitFor(() => expect(store.getState().candidate.savedJobs.length).toBeGreaterThan(0))
    expect(store.getState().candidate.savedJobs[0]).toBe('j1')
  })

  it('skips when userId is not provided', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useUserProfile(undefined), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useSkillsSearch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('skips when keyword is empty', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useSkillsSearch(''), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })

  it('dispatches setAvailableSkills when data arrives', async () => {
    const skills = [
      { skillId: 's1', skillName: 'React', selected: false },
      { skillId: 's2', skillName: 'Vue', selected: true },
    ]
    mockSearchSkills.mockResolvedValue(skills)
    const store = makeTestStore()
    renderHook(() => useSkillsSearch('react', 'u-1'), {
      wrapper: makeWrapper(store),
    })
    await waitFor(() =>
      expect(store.getState().candidate.availableSkills.length).toBeGreaterThan(0),
    )
    expect(store.getState().candidate.availableSkills[0].skillId).toBe('s1')
    expect(store.getState().candidate.selectedSkillIds).toContain('s2')
  })

  it('skips when enabled=false', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useSkillsSearch('react', undefined, false), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })
})

describe('useBuildMyCvQuery', () => {
  beforeEach(() => vi.clearAllMocks())

  it('dispatches setBuildMyCv and sets buildMyCvExists when data arrives', async () => {
    const cvData = {
      resumeId: 'r-1',
      personalDetails: { firstName: 'Jane' },
      careerHistory: [],
      skills: [],
      education: { secondaryEducation: [], tertiaryEducation: [] },
      languages: [],
      validation: [],
    }
    mockGetBuildMyCv.mockResolvedValue(cvData)
    const store = makeTestStore()
    renderHook(() => useBuildMyCvQuery(true, 'c-1'), { wrapper: makeWrapper(store) })
    await waitFor(() => expect(store.getState().candidate.buildMyCvLoaded).toBe(true))
    expect(store.getState().candidate.buildMyCvExists).toBe(true)
  })

  it('skips when enabled=false', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useBuildMyCvQuery(false, 'c-1'), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })

  it('skips when candidateId is empty', () => {
    const store = makeTestStore()
    const { result } = renderHook(() => useBuildMyCvQuery(true, ''), {
      wrapper: makeWrapper(store),
    })
    expect(result.current.isUninitialized).toBe(true)
  })

  it('sets buildMyCvExists based on careerHistory length', async () => {
    const cvData = {
      personalDetails: {},
      careerHistory: [{ company: 'Acme', jobTitle: 'Dev', startDate: '', endDate: '' }],
      skills: [],
      education: { secondaryEducation: [], tertiaryEducation: [] },
      languages: [],
      validation: [],
    }
    mockGetBuildMyCv.mockResolvedValue(cvData)
    const store = makeTestStore()
    renderHook(() => useBuildMyCvQuery(true, 'c-1'), { wrapper: makeWrapper(store) })
    await waitFor(() => expect(store.getState().candidate.buildMyCvLoaded).toBe(true))
    expect(store.getState().candidate.buildMyCvExists).toBe(true)
  })
})

describe('useSaveBuildMyCv', () => {
  it('exposes a save function that calls the mutation', async () => {
    const savedResult = { lastModified: '2024-01-01' }
    mockSaveBuildMyCv.mockResolvedValue(savedResult)
    const store = makeTestStore()
    const { result } = renderHook(() => useSaveBuildMyCv(), {
      wrapper: makeWrapper(store),
    })
    const payload = {
      personalDetails: { firstName: 'Jane', lastName: 'Doe', race: '', gender: '', disabilityStatus: '', nationality: 'SA', location: 'CT', currentCompany: '', currentPosition: '', noticePeriod: '' },
      careerHistory: [],
      skills: [],
      education: { tertiaryEducation: [], secondaryEducation: [] },
      languages: [],
    }
    await act(async () => {
      const data = await result.current.save('c-1', payload)
      expect(data).toEqual(savedResult)
    })
  })

  it('throws a mapped error on failure', async () => {
    mockSaveBuildMyCv.mockRejectedValue({ message: 'Save failed' })
    const store = makeTestStore()
    const { result } = renderHook(() => useSaveBuildMyCv(), {
      wrapper: makeWrapper(store),
    })
    await act(async () => {
      await expect(result.current.save('c-1', {} as never)).rejects.toMatchObject({
        message: expect.any(String),
      })
    })
  })
})

describe('useUpdateBuildMyCv', () => {
  it('exposes an update function that calls the mutation', async () => {
    const updatedResult = { lastModified: '2024-06-01' }
    mockUpdateBuildMyCv.mockResolvedValue(updatedResult)
    const store = makeTestStore()
    const { result } = renderHook(() => useUpdateBuildMyCv(), {
      wrapper: makeWrapper(store),
    })
    const payload = {
      personalDetails: { firstName: 'Jane', lastName: 'Doe', race: '', gender: '', disabilityStatus: '', nationality: 'SA', location: 'CT', currentCompany: '', currentPosition: '', noticePeriod: '' },
      careerHistory: [],
      skills: [],
      education: { tertiaryEducation: [], secondaryEducation: [] },
      languages: [],
    }
    await act(async () => {
      const data = await result.current.update('c-1', payload)
      expect(data).toEqual(updatedResult)
    })
  })
})

describe('useUpdateCandidateProfileMutation', () => {
  it('exposes mutateAsync that calls the RTK mutation', async () => {
    mockUpdateById.mockResolvedValue(mockProfile)
    mockGetById.mockResolvedValue(mockProfile)
    const store = makeTestStore()
    const { result } = renderHook(() => useUpdateCandidateProfileMutation(), {
      wrapper: makeWrapper(store),
    })
    await act(async () => {
      const data = await result.current.mutateAsync({
        userId: 'u-1',
        payload: { personalDetails: { firstName: 'Updated' } } as never,
      })
      expect(data).toBeDefined()
    })
  })
})

describe('useSaveJob', () => {
  it('triggers saveJob mutation with the canonical request body', async () => {
    mockSaveJob.mockResolvedValue({ data: {} })
    const store = makeTestStore()
    const { result } = renderHook(() => useSaveJob(), { wrapper: makeWrapper(store) })
    await act(async () => {
      const [trigger] = result.current
      await trigger({ candidateId: 'candidate-1', jobProfileId: 'job-1' }).unwrap()
    })
  })
})
