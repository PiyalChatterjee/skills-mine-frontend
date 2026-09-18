import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

// Asset mocks
vi.mock('@/assets/login-face-img.jpg', () => ({ default: 'face.jpg' }))
vi.mock('@/assets/login-vector.svg', () => ({ default: 'vector.svg' }))
vi.mock('@/assets/icons/password-eye-figma.svg', () => ({ default: 'eye.svg' }))

const mockNavigate = vi.hoisted(() => vi.fn())
const mockLogin = vi.hoisted(() => vi.fn())
const mockApiLogin = vi.hoisted(() => vi.fn())
const mockIsProfileComplete = vi.hoisted(() => vi.fn())
const mockForgotPassword = vi.hoisted(() => vi.fn())
const mockDispatch = vi.hoisted(() => vi.fn())
const mockRedirectToGoogleLogin = vi.hoisted(() => vi.fn())
const mockAuthState = vi.hoisted(() => ({
  login: mockLogin,
  isAuthenticated: false,
  user: null as null | { userId: string; role: string },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/app/auth/AuthContext', () => ({
  useAuth: () => mockAuthState,
}))

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}))

vi.mock('@/app/auth/cognitoHostedUi', () => ({
  redirectToGoogleLogin: mockRedirectToGoogleLogin,
}))

vi.mock('@/services/api/authApi', () => ({
  authApi: { login: mockApiLogin },
  mapLoginResponseToSession: (r: unknown) => Promise.resolve(r),
}))

vi.mock('@/services/api', () => ({
  authApi: {
    forgotPassword: mockForgotPassword,
  },
}))

vi.mock('@/modules/candidate/utils/profileCompleteness', () => ({
  isCandidateProfileCompleteForOnboarding: mockIsProfileComplete,
}))

const mockAuthApi = { login: mockApiLogin }

const renderPage = (initialEntry = '/login') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LoginPage />
    </MemoryRouter>,
  )

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthState.isAuthenticated = false
    mockAuthState.user = null
    mockIsProfileComplete.mockReturnValue(true)
  })

  it('renders the email and password fields', () => {
    renderPage('/login?postSignup=candidate')
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
  })

  it('opens the reset modal from the forgot password link url', async () => {
    renderPage('/login')

    const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i })
    expect(forgotPasswordLink).toHaveAttribute('href', '/login?forgot-password=1')

    await userEvent.click(forgotPasswordLink)

    await waitFor(() => {
      expect(screen.getByText(/reset your password/i)).toBeInTheDocument()
    })
  })

  it('renders the Sign in button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows email validation error for invalid email', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Email'), 'invalid')
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows password required error when empty', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Email'), 'test@test.com')
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('calls authApi.login and navigates on success', async () => {
    mockAuthApi.login.mockResolvedValue({
      accessToken: 'abc',
      refreshToken: 'def',
      user: { userId: 'user-1', role: 'RECRUITER' },
    })
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'mypassword')
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@test.com', password: 'mypassword' }),
      )
      expect(mockLogin).toHaveBeenCalled()
    })
  })

  it('shows error message when login fails', async () => {
    mockAuthApi.login.mockRejectedValue(new Error('Unauthorized'))
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('Email'), 'user@test.com')
    await userEvent.type(screen.getByPlaceholderText('Password'), 'wrongpass')
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => {
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    })
  })

  it('renders AuthHero with correct headline', () => {
    renderPage()
    expect(screen.getByText(/where talent meets opportunity/i)).toBeInTheDocument()
  })

  it('redirects to Cognito Hosted UI when Sign in with Google is clicked', async () => {
    mockRedirectToGoogleLogin.mockResolvedValue(undefined)
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))
    await waitFor(() => {
      expect(mockRedirectToGoogleLogin).toHaveBeenCalled()
    })
  })

  it('shows error when the Cognito Google redirect fails', async () => {
    mockRedirectToGoogleLogin.mockRejectedValue(new Error('Redirect failed'))
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }))
    await waitFor(() => {
      expect(screen.getByText(/google sign-in failed/i)).toBeInTheDocument()
    })
  })

  it('shows error when redirected back from Cognito with a callback error', () => {
    renderPage('/login?error=google_callback')
    expect(screen.getByText(/google sign-in failed/i)).toBeInTheDocument()
  })

  it('routes authenticated job seeker with incomplete profile to profile creation', async () => {
    mockAuthState.isAuthenticated = true
    mockAuthState.user = { userId: 'candidate-1', role: 'JOB_SEEKER' }
    mockIsProfileComplete.mockReturnValue(false)

    renderPage('/login?postSignup=candidate')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile/create', { replace: true })
    })
  })

  it('does not send an existing incomplete profile through onboarding on normal login', async () => {
    mockAuthState.isAuthenticated = true
    mockAuthState.user = { userId: 'candidate-1', role: 'JOB_SEEKER' }
    mockIsProfileComplete.mockReturnValue(false)

    renderPage('/login')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/candidate/dashboard', { replace: true })
    })
  })

  it('routes authenticated job seeker with complete profile to dashboard', async () => {
    mockAuthState.isAuthenticated = true
    mockAuthState.user = { userId: 'candidate-1', role: 'JOB_SEEKER' }
    mockIsProfileComplete.mockReturnValue(true)

    renderPage()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/candidate/dashboard', { replace: true })
    })
  })

  it('routes a new signup to profile creation even when the initial profile is complete', async () => {
    mockAuthState.isAuthenticated = true
    mockAuthState.user = { userId: 'candidate-1', role: 'JOB_SEEKER' }
    mockIsProfileComplete.mockReturnValue(true)

    renderPage('/login?postSignup=candidate')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile/create', { replace: true })
    })
  })
})
