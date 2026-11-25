import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PermissionGuard } from './PermissionGuard'
import { RoleGuard } from './RoleGuard'
import { ROUTE_PATHS } from '@/routes/routePaths'

const mocks = vi.hoisted(() => ({
  auth: {
    hasPermission: vi.fn(),
    hasRole: vi.fn(),
    user: null as { role: 'JOB_SEEKER' | 'RECRUITER' } | null,
  },
  persistedUser: null as { role: 'JOB_SEEKER' | 'RECRUITER' } | null,
}))

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => mocks.auth,
}))

vi.mock('@/app/auth/tokenStorage', () => ({
  tokenStorage: {
    getUser: () => mocks.persistedUser,
  },
}))

const renderGuard = (guard: React.ReactElement) =>
  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route element={guard}>
          <Route path="/protected" element={<div>Protected content</div>} />
        </Route>
        <Route path="/dashboard" element={<div>Dashboard fallback</div>} />
        <Route path={ROUTE_PATHS.candidateDashboard} element={<div>Candidate dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('role and permission guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.user = null
    mocks.persistedUser = null
    mocks.auth.hasRole.mockReturnValue(false)
    mocks.auth.hasPermission.mockReturnValue(false)
  })

  it('renders role-protected content when the auth context allows the role', () => {
    mocks.auth.user = { role: 'RECRUITER' }
    mocks.auth.hasRole.mockReturnValue(true)

    renderGuard(<RoleGuard allowedRoles={['RECRUITER']} />)

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('uses the persisted role during auth hydration', () => {
    mocks.persistedUser = { role: 'RECRUITER' }

    renderGuard(<RoleGuard allowedRoles={['RECRUITER']} />)

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects a disallowed role to its default dashboard', () => {
    mocks.auth.user = { role: 'JOB_SEEKER' }

    renderGuard(<RoleGuard allowedRoles={['RECRUITER']} />)

    expect(screen.getByText('Candidate dashboard')).toBeInTheDocument()
  })

  it('uses an explicit fallback instead of the role dashboard', () => {
    mocks.auth.user = { role: 'JOB_SEEKER' }

    renderGuard(
      <RoleGuard allowedRoles={['RECRUITER']} fallbackPath={ROUTE_PATHS.dashboard} />,
    )

    expect(screen.getByText('Dashboard fallback')).toBeInTheDocument()
  })

  it('renders permission-protected content when all permissions are present', () => {
    mocks.auth.hasPermission.mockReturnValue(true)

    renderGuard(<PermissionGuard requiredPermissions={['CRM_EDIT']} />)

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects when a required permission is missing', () => {
    renderGuard(<PermissionGuard requiredPermissions={['CRM_EDIT']} />)

    expect(screen.getByText('Dashboard fallback')).toBeInTheDocument()
  })
})
