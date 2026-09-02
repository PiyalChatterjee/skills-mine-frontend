import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CandidateOnboardingGuard } from './CandidateOnboardingGuard'

const mocks = vi.hoisted(() => ({
  profileComplete: false,
  profileData: {} as object | undefined,
  cvData: undefined as object | undefined,
}))

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => ({
    user: { userId: 'user-1', candidateId: 'candidate-1' },
  }),
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
    useCandidateProfileQuery: () => ({
      data: mocks.profileData,
      isLoading: false,
      isFetching: false,
    }),
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
    mocks.profileComplete = false
    mocks.profileData = {}
    mocks.cvData = undefined
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