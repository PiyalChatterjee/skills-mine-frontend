import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SignupPage from './SignupPage'

vi.mock('@/assets/login-face-img.jpg', () => ({ default: 'face.jpg' }))
vi.mock('@/assets/login-vector.svg', () => ({ default: 'vector.svg' }))
vi.mock('@/assets/icons/password-eye-figma.svg', () => ({ default: 'eye.svg' }))

const mockRegister = vi.hoisted(() => vi.fn())

vi.mock('@/services/api/authApi', () => ({
  authApi: { register: mockRegister },
}))

const renderPage = () =>
  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  )

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required form fields', () => {
    renderPage()
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Staff Number')).toBeInTheDocument()
  })

  it('renders the Submit button', () => {
    renderPage()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('shows first name validation error on submit with empty field', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('First name'), 'Jane')
    await userEvent.type(screen.getByPlaceholderText('Last name'), 'Doe')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'notanemail')
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows passwords do not match error', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('First name'), 'Jane')
    await userEvent.type(screen.getByPlaceholderText('Last name'), 'Doe')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jane@test.com')
    await userEvent.type(screen.getByPlaceholderText('Phone number'), '+27821234567')
    await userEvent.type(screen.getByPlaceholderText('Staff Number'), 'SM-REC-001')
    await userEvent.type(screen.getByPlaceholderText('At least 8 characters'), 'Password1')
    await userEvent.type(screen.getByPlaceholderText('Re-enter your password'), 'Different1')
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('calls authApi.register and shows success message on valid submit', async () => {
    mockRegister.mockResolvedValue({})
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('First name'), 'Jane')
    await userEvent.type(screen.getByPlaceholderText('Last name'), 'Doe')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jane@test.com')
    await userEvent.type(screen.getByPlaceholderText('Phone number'), '+27821234567')
    await userEvent.type(screen.getByPlaceholderText('Staff Number'), 'SM-REC-001')
    await userEvent.type(screen.getByPlaceholderText('At least 8 characters'), 'Password1!')
    await userEvent.type(screen.getByPlaceholderText('Re-enter your password'), 'Password1!')

    // Check the terms checkbox
    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled()
      expect(screen.getByText(/you can now continue with sign in/i)).toBeInTheDocument()
    })
  })

  it('renders AuthHero with correct headline', () => {
    renderPage()
    expect(screen.getByText(/global talent acquisition specialists/i)).toBeInTheDocument()
  })

  it('shows acceptTerms validation error when not checked', async () => {
    renderPage()
    await userEvent.type(screen.getByPlaceholderText('First name'), 'Jane')
    await userEvent.type(screen.getByPlaceholderText('Last name'), 'Doe')
    await userEvent.type(screen.getByPlaceholderText('Email'), 'jane@test.com')
    await userEvent.type(screen.getByPlaceholderText('Phone number'), '+27821234567')
    await userEvent.type(screen.getByPlaceholderText('Staff Number'), 'SM-REC-001')
    await userEvent.type(screen.getByPlaceholderText('At least 8 characters'), 'Password1!')
    await userEvent.type(screen.getByPlaceholderText('Re-enter your password'), 'Password1!')
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => {
      expect(screen.getByText(/accept the terms/i)).toBeInTheDocument()
    })
  })
})
