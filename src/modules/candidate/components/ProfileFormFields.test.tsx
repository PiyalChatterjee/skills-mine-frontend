import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useZodForm } from '@/hooks/useZodForm'
import { validateAndFocusForm } from '@/app/formValidation'
import { ProfileTextField, ProfileSelectField } from './ProfileFormFields'
import { toPreferredLocationLabel } from '@/modules/candidate/utils/profileEnums'

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
  label = 'First Name',
}: {
  disabled?: boolean
  fullWidth?: boolean
  label?: string
}) => {
  const { control } = useForm<TestForm>({ defaultValues: { firstName: 'Jane', role: '' } })
  return (
    <ProfileTextField
      control={control}
      name="firstName"
      label={label}
      placeholder="Enter first name"
      disabled={disabled}
      fullWidth={fullWidth}
    />
  )
}

const SelectFieldWrapper = ({
  disabled = false,
  options = ['Engineer', 'Designer', 'Manager'],
  label = 'Role',
  initialRole = '',
  resolveValue,
}: {
  disabled?: boolean
  options?: string[]
  label?: string
  initialRole?: string
  resolveValue?: (value: string, options: readonly string[]) => string
}) => {
  const { control } = useForm<TestForm>({ defaultValues: { firstName: '', role: initialRole } })
  return (
    <ProfileSelectField
      control={control}
      name="role"
      label={label}
      placeholder="Select a role"
      options={options}
      resolveValue={resolveValue}
      disabled={disabled}
    />
  )
}

const PhoneFieldWrapper = ({ initialValue = '' }: { initialValue?: string }) => {
  const { control, reset } = useForm<{ phone: string }>({ defaultValues: { phone: initialValue } })
  const phone = useWatch({ control, name: 'phone' })
  return (
    <>
      <ProfileTextField control={control} name="phone" label="Phone number" type="tel" maxLength={10} />
      <output data-testid="raw-phone">{phone}</output>
      <button onClick={() => reset({ phone: '0748227664' })}>Reset phone</button>
    </>
  )
}

describe('phone fields', () => {
  it('automatically spaces typed digits while storing only digits', async () => {
    const user = userEvent.setup()
    render(<PhoneFieldWrapper />)
    const input = screen.getByRole('textbox', { name: 'Phone Number' })
    await user.type(input, '2345677890')
    expect(input).toHaveValue('234 567 7890')
    expect(screen.getByTestId('raw-phone')).toHaveTextContent('2345677890')
    await user.type(input, '1')
    expect(input).toHaveValue('234 567 7890')
  })

  it('formats initial values and form resets', async () => {
    const user = userEvent.setup()
    render(<PhoneFieldWrapper initialValue="0821234567" />)
    expect(screen.getByRole('textbox', { name: 'Phone Number' })).toHaveValue('082 123 4567')
    await user.click(screen.getByRole('button', { name: 'Reset phone' }))
    expect(screen.getByRole('textbox', { name: 'Phone Number' })).toHaveValue('074 822 7664')
  })

  it('normalizes pasted formatted numbers and country codes without truncating the paste', async () => {
    const user = userEvent.setup()
    render(<PhoneFieldWrapper />)
    const input = screen.getByRole('textbox', { name: 'Phone Number' })
    await user.click(input)
    await user.paste('+27 074 822 7664')
    expect(input).toHaveValue('074 822 7664')
    expect(screen.getByTestId('raw-phone')).toHaveTextContent('0748227664')
    await user.clear(input)
    expect(input).toHaveValue('')
    expect(screen.getByTestId('raw-phone')).toBeEmptyDOMElement()
  })

  it('deletes digits across automatic separators and preserves the editing position', async () => {
    const user = userEvent.setup()
    render(<PhoneFieldWrapper initialValue="2345677890" />)
    const input = screen.getByRole('textbox', { name: 'Phone Number' }) as HTMLInputElement
    await user.click(input)
    input.setSelectionRange(4, 4)
    await user.keyboard('{Backspace}')
    expect(input).toHaveValue('235 677 890')
    expect(input.selectionStart).toBe(2)
    await user.keyboard('4')
    expect(input).toHaveValue('234 567 7890')
    input.setSelectionRange(3, 3)
    await user.keyboard('{Delete}')
    expect(input).toHaveValue('234 677 890')
    expect(input.selectionStart).toBe(3)
  })
})

describe('ProfileTextField', () => {
  it('marks asterisk-labelled fields as required for assistive technology', () => {
    render(<TextFieldWrapper label="First Name*" />)
    expect(screen.getByRole('textbox', { name: 'First Name*' })).toHaveAttribute('aria-required', 'true')
  })

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

const ValidationWrapper = ({ firstName }: { firstName: string }) => {
  const form = useZodForm(z.object({
    firstName: z.string().min(1, 'First name is required'),
    role: z.string().min(1, 'Role is required'),
  }), { defaultValues: { firstName, role: '' } })
  const { control } = form
  return (
    <>
      <ProfileTextField control={control} name="firstName" label="First name" />
      <ProfileSelectField control={control} name="role" label="Role" options={['Engineer']} />
      <button onClick={() => void validateAndFocusForm(form)}>Save profile</button>
    </>
  )
}

describe('profile validation focus', () => {
  it.each([
    { firstName: '', role: 'textbox', label: 'First Name' },
    { firstName: 'Jane', role: 'combobox', label: 'Role' },
  ])('focuses the first invalid $role on submission', async ({ firstName, role, label }) => {
    const user = userEvent.setup()
    render(<ValidationWrapper firstName={firstName} />)
    await user.click(screen.getByRole('button', { name: 'Save profile' }))
    await waitFor(() => expect(screen.getByRole(role, { name: label })).toHaveFocus())
  })
})

describe('ProfileSelectField', () => {
  it('resolves a saved enum against API options when they arrive', () => {
    const { rerender } = render(
      <SelectFieldWrapper initialRole="AFRICA_WIDE" options={[]} resolveValue={toPreferredLocationLabel} />,
    )

    rerender(
      <SelectFieldWrapper initialRole="AFRICA_WIDE" options={['Africa-wide']} resolveValue={toPreferredLocationLabel} />,
    )

    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveTextContent('Africa-wide')
  })

  it('marks asterisk-labelled dropdowns as required for assistive technology', () => {
    render(<SelectFieldWrapper label="Role*" />)
    expect(screen.getByRole('combobox', { name: 'Role*' })).toHaveAttribute('aria-required', 'true')
  })

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

const ClearableSelectWrapper = ({
  label,
  initialRole = '',
  multiple = false,
}: {
  label: string
  initialRole?: string
  multiple?: boolean
}) => {
  const { control } = useForm<TestForm>({ defaultValues: { firstName: '', role: initialRole } })
  const role = useWatch({ control, name: 'role' })
  return (
    <>
      <ProfileSelectField
        control={control}
        name="role"
        label={label}
        placeholder="Select a role"
        options={['Engineer', 'Designer']}
        multiple={multiple}
      />
      <output data-testid="role-value">{role}</output>
    </>
  )
}

describe('ProfileSelectField None option', () => {
  it('does not offer None until an optional dropdown has a value', async () => {
    const user = userEvent.setup()
    render(<ClearableSelectWrapper label="Role" />)

    await user.click(screen.getByRole('combobox', { name: 'Role' }))

    expect(screen.queryByRole('option', { name: 'None' })).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Select a role' })).toHaveAttribute('aria-disabled', 'true')
  })

  it('clears an optional dropdown when None is chosen', async () => {
    const user = userEvent.setup()
    render(<ClearableSelectWrapper label="Role" initialRole="Engineer" />)

    await user.click(screen.getByRole('combobox', { name: 'Role' }))
    await user.click(screen.getByRole('option', { name: 'None' }))

    expect(screen.getByTestId('role-value')).toBeEmptyDOMElement()
    expect(screen.getByText('Select a role')).toBeInTheDocument()
  })

  it('never offers None on a required dropdown', async () => {
    const user = userEvent.setup()
    render(<ClearableSelectWrapper label="Role*" initialRole="Engineer" />)

    await user.click(screen.getByRole('combobox', { name: 'Role*' }))

    expect(screen.queryByRole('option', { name: 'None' })).not.toBeInTheDocument()
  })

  it('clears every selection of an optional multi-select when None is chosen', async () => {
    const user = userEvent.setup()
    render(<ClearableSelectWrapper label="Role" initialRole="Engineer, Designer" multiple />)

    await user.click(screen.getByRole('combobox', { name: 'Role' }))
    await user.click(screen.getByRole('option', { name: 'None' }))

    expect(screen.getByTestId('role-value')).toBeEmptyDOMElement()
  })

  it('joins multi-select values when options are toggled', async () => {
    const user = userEvent.setup()
    render(<ClearableSelectWrapper label="Role" initialRole="Engineer" multiple />)

    await user.click(screen.getByRole('combobox', { name: 'Role' }))
    await user.click(screen.getByRole('option', { name: 'Designer' }))

    expect(screen.getByTestId('role-value')).toHaveTextContent('Engineer, Designer')
  })
})
