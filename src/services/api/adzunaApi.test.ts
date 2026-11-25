import { beforeEach, describe, expect, it, vi } from 'vitest'
import { adzunaApi } from './adzunaApi'

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/services/api/axios', () => ({
  externalJobsApiClient: { get: mocks.get },
  unwrapResponseData: async (response: Promise<{ data: unknown }>) => (await response).data,
}))

describe('Adzuna edit loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the saved advert by job ID without calling create prefill', async () => {
    const jobData = { id: 'advert-1', title: 'Published title', category: 5, job_profile_id_ref: 'profile-1' }
    mocks.get.mockResolvedValue({ data: [{ job_id: 'advert-1', job_data: jobData }] })

    await expect(adzunaApi.getAdzunaEditData('advert-1')).resolves.toEqual({
      job_profile_id: 'profile-1',
      prefill: jobData,
      missing_fields: [],
      warnings: [],
    })
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith(
      '/external-jobs/adzuna/publishes',
      { params: { job_id: 'advert-1' } },
    )
  })

  it.each([
    { records: [] },
    { records: [{ job_id: 'different-advert', job_data: { title: 'Other advert' } }] },
  ])(
    'rejects missing saved adverts without a prefill fallback',
    async ({ records }) => {
      mocks.get.mockResolvedValue({ data: records })

      await expect(adzunaApi.getAdzunaEditData('advert-1')).rejects.toThrow(
        'The published Adzuna advert could not be found.',
      )
      expect(mocks.get).toHaveBeenCalledTimes(1)
    },
  )

  it('preserves unfiltered listing behavior', async () => {
    mocks.get.mockResolvedValue({ data: [] })

    await expect(adzunaApi.getAdzunaJobsAsJson()).resolves.toEqual([])
    expect(mocks.get).toHaveBeenCalledExactlyOnceWith('/external-jobs/adzuna/publishes', undefined)
  })

  it.each(['0', '1'])('normalizes saved remote value %s to a numeric request value', async (remote) => {
    mocks.get.mockResolvedValue({ data: [{ job_id: 'advert-1', job_data: { remote } }] })

    expect((await adzunaApi.getAdzunaEditData('advert-1')).prefill.remote).toBe(Number(remote))
  })

  it('rejects unsupported saved remote values', async () => {
    mocks.get.mockResolvedValue({ data: [{ job_id: 'advert-1', job_data: { remote: 'invalid' } }] })

    await expect(adzunaApi.getAdzunaEditData('advert-1')).rejects.toThrow('unsupported remote work value')
  })
})
