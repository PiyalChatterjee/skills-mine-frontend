import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CandidateOnboardingGuard } from './CandidateOnboardingGuard'

const mocks = vi.hoisted(() => ({
  authUser: { userId: 'user-1', candidateId: 'candidate-1' } as {
    userId: string
    candidateId: string
    role?: string
  } | null,
  persistedUser: null as { userId: string; candidateId: string } | null,
  profileComplete: false,
  profileData: {} as object | undefined,
  cvData: undefined as object | undefined,
  profileLoading: false,
  cvLoading: false,
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
        isLoading: mocks.profileLoading,
        isFetching: false,
      }
    },
    useBuildMyCvQuery: () => ({
      data: mocks.cvData,
      isLoading: mocks.cvLoading,
      isFetching: false,
    }),
  }
})

const renderGuard = (path = '/candidate/dashboard') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<CandidateOnboardingGuard />}>
          <Route path="/candidate/dashboard" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/profile/create" element={<div>Profile creation</div>} />
        <Route path="/jobs/:jobId" element={<div>Job details</div>} />
        <Route element={<CandidateOnboardingGuard requireCv={false} />}>
          <Route path="/candidate/cv-builder" element={<div>CV builder</div>} />
        </Route>
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
    mocks.profileLoading = false
    mocks.cvLoading = false
    mocks.profileQuery.mockClear()
  })

  it('shows a loading state while the profile loads', () => {
    mocks.profileLoading = true
    renderGuard()

    expect(screen.getByRole('status')).toHaveTextContent('Loading your profile...')
  })

  it('shows a loading state while the CV loads for a complete profile', () => {
    mocks.profileComplete = true
    mocks.cvLoading = true
    renderGuard()

    expect(screen.getByRole('status')).toHaveTextContent('Loading your CV...')
  })

  it('does not wait for the CV on the CV builder route', () => {
    mocks.profileComplete = true
    mocks.cvLoading = true
    renderGuard('/candidate/cv-builder')

    expect(screen.getByText('CV builder')).toBeInTheDocument()
  })

  it('hands off to the pending job once onboarding is complete', () => {
    mocks.profileComplete = true
    mocks.cvData = { resumeId: 'RES100001' }
    renderGuard('/candidate/dashboard?job=JOB-9')

    expect(screen.getByText('Job details')).toBeInTheDocument()
  })

  it('preserves the pending job query when redirecting to profile creation', () => {
    renderGuard('/candidate/cv-builder?job=JOB-9')

    expect(screen.getByText('Profile creation')).toBeInTheDocument()
  })

  it('uses the persisted user while the auth context hydrates on refresh', () => {
    mocks.authUser = null
    mocks.persistedUser = {
      userId: 'persisted-user',
      candidateId: 'persisted-candidate',
    }
    mocks.profileComplete = true
    mocks.cvData = { resumeId: 'RES100001' }

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
    mocks.cvData = {
      extractionStatus: 'NOT_STARTED',
      personalDetails: { firstName: 'Jane' },
    }
    renderGuard()

    expect(screen.getByText('CV builder')).toBeInTheDocument()
  })

  it('allows the dashboard when both profile and CV data exist', () => {
    mocks.profileComplete = true
    mocks.cvData = { resumeId: 'RES100001' }
    renderGuard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('blocks CV builder until the profile is complete', () => {
    renderGuard('/candidate/cv-builder')

    expect(screen.getByText('Profile creation')).toBeInTheDocument()
  })

  it('allows CV builder once the profile is complete, before a CV exists', () => {
    mocks.profileComplete = true
    renderGuard('/candidate/cv-builder')

    expect(screen.getByText('CV builder')).toBeInTheDocument()
  })

  it('lets guests through to CV builder', () => {
    mocks.authUser = null
    renderGuard('/candidate/cv-builder')

    expect(screen.getByText('CV builder')).toBeInTheDocument()
  })

  it('does not apply candidate onboarding to other roles', () => {
    mocks.authUser = { userId: 'user-1', candidateId: '', role: 'RECRUITER' }
    renderGuard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})