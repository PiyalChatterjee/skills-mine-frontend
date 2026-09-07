import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProfileCreationWizard } from './useProfileCreationWizard'

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  mutateAsync: vi.fn(),
}))

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate,
}))

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => ({ user: { userId: 'candidate-1', candidateId: 'candidate-1' } }),
}))

vi.mock('@/modules/candidate/hooks/useCandidateQueries', () => ({
  useCandidateProfileQuery: () => ({
    data: null,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  }),
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

    expect(mocks.mutateAsync).toHaveBeenCalled()
    expect(mocks.navigate).toHaveBeenCalledWith('/candidate/cv-builder', {
      replace: true,
    })
  })
})