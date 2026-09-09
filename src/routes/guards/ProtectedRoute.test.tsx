import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beginLogoutNavigation } from '@/app/auth/logoutNavigation'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => ({ isAuthenticated: false, tokens: null }),
}))

vi.mock('@/app/auth/tokenStorage', () => ({
  tokenStorage: { getTokens: () => null },
}))

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={['/candidate/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/candidate/dashboard" element={<div>Dashboard</div>} />
        </Route>
        <Route path="/" element={<div>Landing</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('ProtectedRoute', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('redirects ordinary unauthenticated access to login', () => {
    renderProtectedRoute()

    expect(screen.getByText('Login')).toBeInTheDocument()
  })

  it('redirects explicit logout teardown to the landing page', () => {
    beginLogoutNavigation()

    renderProtectedRoute()

    expect(screen.getByText('Landing')).toBeInTheDocument()
  })
})