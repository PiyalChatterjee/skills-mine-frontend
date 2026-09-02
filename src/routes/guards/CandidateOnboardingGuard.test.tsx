import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CandidateOnboardingGuard } from './CandidateOnboardingGuard'

const mocks = vi.hoisted(() => ({
  authUser: { userId: 'user-1', candidateId: 'candidate-1' } as {
    userId: string
    candidateId: string
  } | null,
  persistedUser: null as { userId: string; candidateId: string } | null,
  profileComplete: false,
  profileData: {} as object | undefined,
  cvData: undefined as object | undefined,
  profileQuery: vi.fn(),
}))

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => ({
    user: mocks.authUser,
  }),
}))

vi.mock('@/app/auth/tokenStorage', () => ({
  tokenStorage: {
    getUser: () => mocks.persistedUser,
  },
}))

vi.mock('@/modules/candidate/utils/profileCompleteness', () => ({
  isCandidateProfileCompleteForOnboarding: () => mocks.profileComplete,
}))

vi.mock('@/modules/candidate/hooks/useCandidateQueries', async () => {
  const actual = await vi.importActual<
    typeof import('@/modules/candidate/hooks/useCandidateQueries')
  >('@/modules/candidate/hooks/useCandidateQueries')

  return {
    ...actual,
    useCandidateProfileQuery: (...args: unknown[]) => {
      mocks.profileQuery(...args)
      return {
        data: mocks.profileData,
        isLoading: false,
        isFetching: false,
      }
    },
    useBuildMyCvQuery: () => ({
      data: mocks.cvData,
      isLoading: false,
      isFetching: false,
    }),
  }
})

const renderGuard = () =>
  render(
    <MemoryRouter initialEntries={['/candidate/dashboard']}>
      <Routes>
        <Route element={<CandidateOnboardingGuard />}>
          <Route path="/candidate/dashboard" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/profile/create" element={<div>Profile creation</div>} />
        <Route path="/candidate/cv-builder" element={<div>CV builder</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('CandidateOnboardingGuard', () => {
  beforeEach(() => {
    mocks.authUser = { userId: 'user-1', candidateId: 'candidate-1' }
    mocks.persistedUser = null
    mocks.profileComplete = false
    mocks.profileData = {}
    mocks.cvData = undefined
    mocks.profileQuery.mockClear()
  })

  it('uses the persisted user while the auth context hydrates on refresh', () => {
    mocks.authUser = null
    mocks.persistedUser = {
      userId: 'persisted-user',
      candidateId: 'persisted-candidate',
    }
    mocks.profileComplete = true
    mocks.cvData = { personalDetails: { firstName: 'Jane' } }

    renderGuard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(mocks.profileQuery).toHaveBeenCalledWith(
      'persisted-candidate',
      'persisted-user',
      true,
    )
  })

  it('redirects an incomplete profile to profile creation', () => {
    renderGuard()

    expect(screen.getByText('Profile creation')).toBeInTheDocument()
  })

  it('redirects a complete profile without CV data to CV builder', () => {
    mocks.profileComplete = true
    renderGuard()

    expect(screen.getByText('CV builder')).toBeInTheDocument()
  })

  it('allows the dashboard when both profile and CV data exist', () => {
    mocks.profileComplete = true
    mocks.cvData = { personalDetails: { firstName: 'Jane' } }
    renderGuard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})