import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileCreationWizard } from './useProfileCreationWizard'

type CandidateProfileQueryMock = {
  data: null
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
}

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  mutateAsync: vi.fn(),
  candidateProfileQuery: {
    data: null,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  } as CandidateProfileQueryMock,
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}))

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => ({ user: { userId: 'candidate-1', candidateId: 'candidate-1' } }),
}))

vi.mock('@/modules/candidate/hooks/useCandidateQueries', () => ({
  useCandidateProfileQuery: () => mocks.candidateProfileQuery,
  useUpdateCandidateProfileMutation: () => ({
    mutateAsync: mocks.mutateAsync,
    isLoading: false,
  }),
}))

describe('useProfileCreationWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    mocks.mutateAsync.mockResolvedValue({})
    mocks.candidateProfileQuery = {
      data: null,
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    }
  })

  it('does not expose a missing profile response for a new candidate', () => {
    mocks.candidateProfileQuery = {
      data: null,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 404, message: 'Request failed with status code 404' },
    }

    const { result } = renderHook(() => useProfileCreationWizard())

    expect(result.current.isError).toBe(false)
    expect(result.current.loadErrorMessage).toBe('')
  })

  it('routes to CV building after saving a valid profile', async () => {
    const { result } = renderHook(() => useProfileCreationWizard())

    act(() => {
      result.current.form.reset({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phoneNumber: '0821234567',
        residentialLocation: 'Cape Town',
        preferredJobTitle: 'Software Engineer',
        targetedIndustries: 'Technology',
        preferredLocations: 'Cape Town',
        employmentType: 'Permanent',
        availability: 'Immediately',
        certifications: [{ value: '' }],
        highestDegreeEarned: '',
        currentJobTitle: '',
        currentEmployer: '',
        totalYearsOfExperience: '',
      })
    })

    await act(async () => {
      await result.current.handleNext()
    })

    expect(mocks.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'candidate-1',
      candidateId: 'candidate-1',
    }))
    expect(mocks.navigate).toHaveBeenCalledWith('/candidate/cv-builder', {
      replace: true,
    })
  })
})