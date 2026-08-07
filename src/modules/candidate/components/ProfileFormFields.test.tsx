import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { ProfileTextField, ProfileSelectField } from './ProfileFormFields'

vi.mock('@/assets/icons/dropdown-chevron.svg', () => ({ default: 'chevron.svg' }))

// Minimal CSS module mock (styles are just class names)
vi.mock('@/modules/candidate/pages/ProfilePage.module.css', () => ({
  default: {
    fieldBlock: 'fieldBlock',
    fieldBlockFull: 'fieldBlockFull',
    fieldLabel: 'fieldLabel',
    readonlyInput: 'readonlyInput',
    readonlyInputDisabled: 'readonlyInputDisabled',
    selectPlaceholder: 'selectPlaceholder',
  },
}))

type TestForm = {
  firstName: string
  role: string
}

const TextFieldWrapper = ({
  disabled = false,
  fullWidth = false,
}: {
  disabled?: boolean
  fullWidth?: boolean
}) => {
  const { control } = useForm<TestForm>({ defaultValues: { firstName: 'Jane', role: '' } })
  return (
    <ProfileTextField
      control={control}
      name="firstName"
      label="First Name"
      placeholder="Enter first name"
      disabled={disabled}
      fullWidth={fullWidth}
    />
  )
}

const SelectFieldWrapper = ({
  disabled = false,
  options = ['Engineer', 'Designer', 'Manager'],
}: {
  disabled?: boolean
  options?: string[]
}) => {
  const { control } = useForm<TestForm>({ defaultValues: { firstName: '', role: '' } })
  return (
    <ProfileSelectField
      control={control}
      name="role"
      label="Role"
      placeholder="Select a role"
      options={options}
      disabled={disabled}
    />
  )
}

describe('ProfileTextField', () => {
  it('renders the label', () => {
    render(<TextFieldWrapper />)
    expect(screen.getByText('First Name')).toBeInTheDocument()
  })

  it('renders with the initial value', () => {
    render(<TextFieldWrapper />)
    expect(screen.getByDisplayValue('Jane')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<TextFieldWrapper />)
    expect(screen.getByPlaceholderText('Enter first name')).toBeInTheDocument()
  })

  it('renders as disabled when disabled prop is true', () => {
    render(<TextFieldWrapper disabled />)
    expect(screen.getByPlaceholderText('Enter first name')).toBeDisabled()
  })
})

describe('ProfileSelectField', () => {
  it('renders the label', () => {
    render(<SelectFieldWrapper />)
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('renders placeholder text when no value selected', () => {
    render(<SelectFieldWrapper />)
    expect(screen.getByText('Select a role')).toBeInTheDocument()
  })

  it('renders without options gracefully', () => {
    render(<SelectFieldWrapper options={[]} />)
    expect(screen.getByText('Role')).toBeInTheDocument()
  })
})
