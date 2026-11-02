import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ResetPasswordPage from './ResetPasswordPage'
import { ROUTE_PATHS } from '@/routes/routePaths'

vi.mock('@/assets/login-face-img.jpg', () => ({ default: 'face.jpg' }))
vi.mock('@/assets/login-vector.svg', () => ({ default: 'vector.svg' }))
vi.mock('@/assets/icons/password-eye-figma.svg', () => ({ default: 'eye.svg' }))

const mockNavigate = vi.hoisted(() => vi.fn())
const mockDispatch = vi.hoisted(() => vi.fn())
const mockResetPassword = vi.hoisted(() => vi.fn())
const mockClearTokens = vi.hoisted(() => vi.fn())
const mockClearUser = vi.hoisted(() => vi.fn())
const mockClearAuth = vi.hoisted(() => vi.fn())

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

vi.mock('@/services/api/authApi', () => ({
  authApi: { resetPassword: mockResetPassword, forgotPassword: vi.fn() },
}))

vi.mock('@/app/auth/tokenStorage', () => ({
  tokenStorage: {
    clearTokens: mockClearTokens,
    clearUser: mockClearUser,
    clearAuth: mockClearAuth,
  },
}))

const renderPage = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <ResetPasswordPage />
    </MemoryRouter>,
  )

const submitValidForm = async () => {
  await userEvent.type(screen.getByPlaceholderText('Confirmation code'), '123456')
  const passwordInputs = screen.getAllByPlaceholderText('Password')
  await userEvent.type(passwordInputs[0], 'Password1!')
  await userEvent.type(passwordInputs[1], 'Password1!')
  fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
}

const submitValidChangePasswordForm = async () => {
  const passwordInputs = screen.getAllByPlaceholderText('Password')
  await userEvent.type(passwordInputs[0], 'Password1!')
  await userEvent.type(passwordInputs[1], 'Password1!')
  await userEvent.type(passwordInputs[2], 'Password1!')
  fireEvent.click(screen.getByRole('button', { name: /change password/i }))
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockResetPassword.mockResolvedValue({ message: 'Password has been reset successfully.' })
    mockDispatch.mockImplementation((action: unknown) => action)
  })

  it('shows an error notification when reset token is missing', async () => {
    renderPage('/reset-password')
    await submitValidForm()

    await waitFor(() => {
      expect(mockResetPassword).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification/pushNotification',
          payload: expect.objectContaining({
            level: 'error',
            title: 'Reset link invalid',
            message: 'Missing email address. Please request a new confirmation code.',
          }),
        }),
      )
    })
  })

  it('validates that new password and confirm password match', async () => {
    renderPage('/reset-password?email=test@example.com')

    const passwordInputs = screen.getAllByPlaceholderText('Password')
    await userEvent.type(passwordInputs[0], 'Password1!')
    await userEvent.type(passwordInputs[1], 'Password2!')
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      expect(mockResetPassword).not.toHaveBeenCalled()
    })
  })

  it('uses backend success message after a successful reset', async () => {
    renderPage('/reset-password?email=test@example.com')
    await submitValidForm()

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        confirmationCode: '123456',
        newPassword: 'Password1!',
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification/pushNotification',
          payload: expect.objectContaining({
            level: 'success',
            title: 'Password reset',
            message: 'Password has been reset successfully.',
          }),
        }),
      )

      expect(mockNavigate).toHaveBeenCalledWith(ROUTE_PATHS.login, {
        replace: true,
      })
      expect(mockClearTokens).toHaveBeenCalledTimes(1)
      expect(mockClearUser).toHaveBeenCalledTimes(1)
      expect(mockClearAuth).toHaveBeenCalledTimes(1)
    })
  })

  it('shows the backend validation message when the reset code is invalid', async () => {
    mockResetPassword.mockRejectedValue({
      response: {
        data: {
          code: 'INVALID_RESET_CODE',
          message: 'The confirmation code is invalid.',
        },
      },
    })

    renderPage('/reset-password?email=test@example.com')
    await submitValidForm()

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification/pushNotification',
          payload: expect.objectContaining({
            level: 'error',
            title: 'Reset failed',
            message: 'The confirmation code is invalid.',
          }),
        }),
      )
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  it('returns to the originating route after a successful password change', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/reset-password',
            search: '?mode=change',
            state: {
              returnTo: {
                pathname: '/recruiter/dashboard',
                search: '?tab=active',
                hash: '#pipeline',
                scrollY: 520,
                state: { selectedFilter: 'mine' },
              },
            },
          },
        ]}
      >
        <ResetPasswordPage />
      </MemoryRouter>,
    )

    await submitValidChangePasswordForm()

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/recruiter/dashboard?tab=active#pipeline',
        {
          replace: true,
          state: { selectedFilter: 'mine', restoreScrollY: 520 },
        },
      )
    })
  })

  it('shows a generic error notification when reset fails without a known code', async () => {
    mockResetPassword.mockRejectedValue({ status: 500 })

    renderPage('/reset-password?email=test@example.com')
    await submitValidForm()

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification/pushNotification',
          payload: expect.objectContaining({
            level: 'error',
            title: 'Reset failed',
            message: 'Unable to reset password. Please try again.',
          }),
        }),
      )
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })
})
