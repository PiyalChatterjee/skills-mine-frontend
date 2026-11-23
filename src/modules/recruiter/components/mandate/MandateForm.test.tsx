import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MandateForm } from './MandateForm'
import type { MandateFormValues } from './types'

vi.mock('@/services/api/mandateApi', () => ({
  mandateApi: {
    getCompanies: () => Promise.resolve([
      { clientId: 'c2', clientName: 'Other Co', contactName: 'Bob', contactEmail: 'b@x.com', contactPhoneNumber: '0829999999', clientRate: 5 },
    ]),
  },
}))
vi.mock('@/services/api/locationApi', () => ({
  locationApi: { getMasterLocations: () => Promise.resolve([]) },
}))

const initial: MandateFormValues = {
  companyName: 'Acme', clientId: 'c1', clientRate: '10', contactPerson: 'Alice',
  contactPersonEmail: 'a@x.com', contactPersonPhone: '0821234567', positionTitle: 'Dev',
  location: 'Cape Town', locationId: '', fillByDate: '2099-01-01', workType: 'Remote',
  employmentType: 'Full Time', experienceLevel: 'Mid', priority: 'High', salaryMin: 1, salaryMax: 2,
  isSalaryHidden: false, jobDescription: 'desc', requirements: '• a', responsibilities: '• b',
  benefits: '• c', skills: ['x'], industries: ['IT'], jobBoards: [],
}

const renderForm = (confirmCompanyChange = true) =>
  render(
    <MandateForm
      title="t"
      submitLabel="Save Changes"
      initialValues={initial}
      onSubmit={vi.fn().mockResolvedValue(undefined)}
      confirmCompanyChange={confirmCompanyChange}
    />,
  )

describe('MandateForm company name change confirmation', () => {
  it('shows the popup when the company name is typed and keeps the original on "No"', async () => {
    renderForm()
    const input = screen.getByPlaceholderText('Company Name') as HTMLInputElement

    await userEvent.type(input, 'x')
    expect(screen.getByText('Change company name?')).toBeTruthy()
    expect(input.value).toBe('Acme')

    await userEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(screen.queryByText('Change company name?')).toBeNull()
    expect(input.value).toBe('Acme')
  })

  it('applies the change on "Yes" and does not ask again', async () => {
    renderForm()
    const input = screen.getByPlaceholderText('Company Name') as HTMLInputElement

    await userEvent.type(input, 'x')
    await userEvent.click(screen.getByRole('button', { name: 'Yes, change' }))
    expect(input.value).toBe('Acmex')

    await userEvent.type(input, 'y')
    expect(screen.queryByText('Change company name?')).toBeNull()
    expect(input.value).toBe('Acmexy')
  })

  it('keeps original company details when "No" is chosen for a suggested company', async () => {
    renderForm()
    const input = screen.getByPlaceholderText('Company Name') as HTMLInputElement

    await userEvent.type(input, 'O')
    await userEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(input.value).toBe('Acme')
    expect((screen.getByPlaceholderText('Contact Person') as HTMLInputElement).value).toBe('Alice')
  })

  it('does not prompt when confirmation is not enabled', async () => {
    renderForm(false)
    const input = screen.getByPlaceholderText('Company Name') as HTMLInputElement

    await userEvent.type(input, 'x')
    expect(screen.queryByText('Change company name?')).toBeNull()
    expect(input.value).toBe('Acmex')
  })
})
