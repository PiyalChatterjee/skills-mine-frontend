import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdzunaPostPage from './AdzunaPostPage'

const mocks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  getJobPostDetail: vi.fn(),
  getAdzunaEditData: vi.fn(),
  getAdzunaPrefill: vi.fn(),
  publishToAdzuna: vi.fn(),
  updateAdzunaJob: vi.fn(),
}))

vi.mock('react-redux', () => ({ useDispatch: () => mocks.dispatch }))
vi.mock('@/modules/recruiter/components/RecruiterSidebar', () => ({ RecruiterSidebar: () => null }))
vi.mock('@/modules/recruiter/components/advertised/bizcommunity/BizRichText', () => ({
  BizRichText: ({ title, value }: { title: string; value: string }) => (
    <textarea aria-label={title} value={value} readOnly />
  ),
}))
vi.mock('@/services/api/mandateApi', () => ({
  mandateApi: { getJobPostDetail: mocks.getJobPostDetail },
}))
vi.mock('@/services/api/adzunaApi', () => ({
  adzunaApi: {
    getAdzunaEditData: mocks.getAdzunaEditData,
    getAdzunaPrefill: mocks.getAdzunaPrefill,
    publishToAdzuna: mocks.publishToAdzuna,
    updateAdzunaJob: mocks.updateAdzunaJob,
  },
}))

const advert = {
  job_profile_id: 'profile-1',
  prefill: {
    title: 'Saved advert title',
    company: 'Published company',
    location: { city: 'Durban', country: 'South Africa' },
    category: 29,
    description: 'Saved description.\n\nRequirements:\nREST APIs\n\nBenefits:\nMedical aid',
  },
  warnings: [],
  missing_fields: [],
}

const renderPage = (search = '') => render(
  <MemoryRouter initialEntries={[`/adzuna/profile-1${search}`]}>
    <Routes>
      <Route path="/adzuna/:mandateId" element={<AdzunaPostPage />} />
    </Routes>
  </MemoryRouter>,
)

describe('Adzuna form loading', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.getAdzunaEditData.mockResolvedValue(advert)
    mocks.getAdzunaPrefill.mockResolvedValue(advert)
    mocks.getJobPostDetail.mockResolvedValue({ data: { title: 'Job title', industry: 'Technology', requirements: ['REST APIs'] } })
    mocks.publishToAdzuna.mockResolvedValue({})
    mocks.updateAdzunaJob.mockResolvedValue({})
  })

  it.each([
    { search: '?adzunaJobId=advert-1', method: 'getAdzunaEditData' as const },
    { search: '', method: 'getAdzunaPrefill' as const },
  ])('shows a spinner until the Adzuna form is populated', async ({ search, method }) => {
    let resolveAdvert!: (value: typeof advert) => void
    mocks[method].mockReturnValue(new Promise<typeof advert>((resolve) => { resolveAdvert = resolve }))
    renderPage(search)

    expect(screen.getByRole('progressbar', { name: 'Loading Adzuna job details' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Job Title/ })).not.toBeInTheDocument()

    await act(async () => { resolveAdvert(advert) })
    expect(screen.queryByRole('progressbar', { name: 'Loading Adzuna job details' })).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Job Title/ })).toHaveValue('Saved advert title')
  })

  it('loads edit values from the saved advert without calling mandate service or create prefill', async () => {
    renderPage('?adzunaJobId=advert-1')

    await waitFor(() => expect(screen.getByRole('button', { name: 'Update on Adzuna' })).toBeEnabled())
    expect(screen.getByRole('textbox', { name: /Job Title/ })).toHaveValue('Saved advert title')
    expect(screen.getByRole('textbox', { name: /Company Name/ })).toHaveValue('Published company')
    expect(screen.getByRole('textbox', { name: 'Requirements & Experience *' })).toHaveValue('REST APIs')
    expect(mocks.getAdzunaEditData).toHaveBeenCalledExactlyOnceWith('advert-1')
    expect(mocks.getJobPostDetail).not.toHaveBeenCalled()
    expect(mocks.getAdzunaPrefill).not.toHaveBeenCalled()
  })

  it('retains job-profile defaults and prefill loading for create', async () => {
    renderPage()

    await waitFor(() => expect(screen.getByRole('button', { name: 'Publish to Adzuna' })).toBeEnabled())
    expect(mocks.getJobPostDetail).toHaveBeenCalledExactlyOnceWith('profile-1')
    expect(mocks.getAdzunaPrefill).toHaveBeenCalledExactlyOnceWith('profile-1')
    expect(mocks.getAdzunaEditData).not.toHaveBeenCalled()
  })

  it('keeps update disabled and reports a saved-advert failure without requesting mandate data', async () => {
    mocks.getAdzunaEditData.mockRejectedValue(new Error('Advert unavailable'))
    renderPage('?adzunaJobId=advert-1')

    await waitFor(() => expect(mocks.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      payload: expect.objectContaining({ title: 'Unable to load Adzuna advert' }),
    })))
    await waitFor(() => expect(screen.queryByRole('progressbar', { name: 'Loading Adzuna job details' })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Update on Adzuna' })).toBeDisabled()
    expect(mocks.getJobPostDetail).not.toHaveBeenCalled()
    expect(mocks.getAdzunaPrefill).not.toHaveBeenCalled()
  })

  it.each([
    { search: '', button: 'Publish to Adzuna', method: 'publishToAdzuna' as const },
    { search: '?adzunaJobId=advert-1', button: 'Update on Adzuna', method: 'updateAdzunaJob' as const },
  ])('submits $button without unsupported contact or expiry fields', async ({ search, button, method }) => {
    renderPage(search)
    await waitFor(() => expect(screen.getByRole('button', { name: button })).toBeEnabled())

    expect(screen.queryByText('Primary Recruiter Contact')).not.toBeInTheDocument()
    expect(screen.queryByText(/Recruiter Email/)).not.toBeInTheDocument()
    expect(screen.queryByText('Listing Expiry Date')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: button }))

    await waitFor(() => expect(mocks[method]).toHaveBeenCalledOnce())
    const args = mocks[method].mock.calls[0]
    const request = args[args.length - 1]
    expect(request).toMatchObject({
      title: 'Saved advert title',
      category: 29,
      location: { city: 'Durban', country: 'South Africa' },
    })
    expect(request).not.toHaveProperty('contact_name')
    expect(request).not.toHaveProperty('contact_email')
    expect(request).not.toHaveProperty('expiry_date')
  })
})
