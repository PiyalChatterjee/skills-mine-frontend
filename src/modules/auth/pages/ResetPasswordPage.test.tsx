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
const mockResetPasswordThunk = vi.hoisted(() => vi.fn())
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

vi.mock('@/store/slices/authThunks', () => ({
  resetPasswordThunk: mockResetPasswordThunk,
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
  const passwordInputs = screen.getAllByPlaceholderText('Password')
  await userEvent.type(passwordInputs[0], 'Password1!')
  await userEvent.type(passwordInputs[1], 'Password1!')
  fireEvent.click(screen.getByRole('button', { name: /reset password/i }))
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockResetPasswordThunk.mockImplementation((payload: unknown) => ({
      type: 'auth/resetPasswordThunkMock',
      payload,
    }))

    mockDispatch.mockImplementation((action: { type?: string }) => {
      if (action?.type === 'auth/resetPasswordThunkMock') {
        return {
          unwrap: () => Promise.resolve({
            success: true,
            statusCode: 200,
            message: 'Password has been reset successfully.',
          }),
        }
      }
      return action
    })
  })

  it('shows an error notification when reset token is missing', async () => {
    renderPage('/reset-password')
    await submitValidForm()

    await waitFor(() => {
      expect(mockResetPasswordThunk).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'notification/pushNotification',
          payload: expect.objectContaining({
            level: 'error',
            title: 'Reset link invalid',
            message: 'Missing reset token. Please request a new reset link.',
          }),
        }),
      )
    })
  })

  it('uses backend success message after a successful reset', async () => {
    renderPage('/reset-password?token=reset-token-123')
    await submitValidForm()

    await waitFor(() => {
      expect(mockResetPasswordThunk).toHaveBeenCalledWith({
        resetToken: 'reset-token-123',
        newPassword: 'Password1!',
        confirmNewPassword: 'Password1!',
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

  it('shows a generic error notification when reset fails', async () => {
    mockDispatch.mockImplementation((action: { type?: string }) => {
      if (action?.type === 'auth/resetPasswordThunkMock') {
        return {
          unwrap: () => Promise.reject(new Error('failed')),
        }
      }
      return action
    })

    renderPage('/reset-password?token=reset-token-123')
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
