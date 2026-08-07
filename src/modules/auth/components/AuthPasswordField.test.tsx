import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import AuthPasswordField from './AuthPasswordField'

vi.mock('@/assets/icons/password-eye-figma.svg', () => ({ default: 'eye-icon.svg' }))

const makeRegistration = () => ({
  name: 'password' as const,
  ref: vi.fn(),
  onChange: vi.fn(),
  onBlur: vi.fn(),
})

const defaultProps = {
  label: 'Password',
  placeholder: 'Enter your password',
  error: false,
  registration: makeRegistration(),
  fieldGroupClassName: 'field-group',
  fieldLabelClassName: 'field-label',
  inputFieldClassName: 'input-field',
  toggleButtonClassName: 'toggle-btn',
  toggleIconClassName: 'toggle-icon',
}

describe('AuthPasswordField', () => {
  it('renders the label', () => {
    render(<AuthPasswordField {...defaultProps} />)
    expect(screen.getByText('Password')).toBeInTheDocument()
  })

  it('renders as password type by default', () => {
    render(<AuthPasswordField {...defaultProps} />)
    const input = screen.getByPlaceholderText('Enter your password')
    expect(input).toHaveAttribute('type', 'password')
  })

  it('does not show toggle button when no value', () => {
    render(<AuthPasswordField {...defaultProps} value="" />)
    expect(screen.queryByRole('button', { name: /show password/i })).not.toBeInTheDocument()
  })

  it('shows toggle button when value is present', () => {
    render(<AuthPasswordField {...defaultProps} value="mysecret" />)
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument()
  })

  it('toggles from password to text when toggle button clicked', () => {
    render(<AuthPasswordField {...defaultProps} value="mysecret" />)
    const input = screen.getByPlaceholderText('Enter your password')
    expect(input).toHaveAttribute('type', 'password')
    fireEvent.click(screen.getByRole('button', { name: /show password/i }))
    expect(input).toHaveAttribute('type', 'text')
  })

  it('toggles back to password on second click', () => {
    render(<AuthPasswordField {...defaultProps} value="mysecret" />)
    const btn = screen.getByRole('button', { name: /show password/i })
    fireEvent.click(btn)
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByPlaceholderText('Enter your password')).toHaveAttribute('type', 'password')
  })

  it('displays error helper text', () => {
    render(
      <AuthPasswordField
        {...defaultProps}
        error
        helperText="Password is required"
      />,
    )
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('applies fieldGroupClassName to the wrapper', () => {
    const { container } = render(<AuthPasswordField {...defaultProps} />)
    expect(container.firstChild).toHaveClass('field-group')
  })
})
