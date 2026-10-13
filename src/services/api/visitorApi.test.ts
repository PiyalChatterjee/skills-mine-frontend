import { beforeEach, describe, expect, it, vi } from 'vitest'
import { visitorApi } from './visitorApi'

const mocks = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('./axios', () => ({
  visitorApiClient: { post: mocks.post },
  publicDocumentApiClient: {},
  unwrapResponseData: async (response: Promise<{ data: unknown }>) => (await response).data,
}))

describe('visitorApi.applyToJob', () => {
  beforeEach(() => {
    mocks.post.mockReset()
  })

  it('waits up to 60 seconds for application processing and preserves the response', async () => {
    const application = { application_id: 'app-1', match_score_latest: 80 }
    mocks.post.mockResolvedValue({ data: application })

    const result = await visitorApi.applyToJob({ visitorId: 'visitor-1', jobProfileId: 'job-1' })

    expect(mocks.post).toHaveBeenCalledExactlyOnceWith(
      '/visitors/apply',
      { visitor_id: 'visitor-1', job_profile_id: 'job-1' },
      { timeout: 60000 },
    )
    expect(result).toEqual(application)
  })

  it.each([
    { code: 'ECONNABORTED', message: 'timeout of 60000ms exceeded' },
    { response: { status: 409, data: { message: 'Already applied' } } },
  ])('propagates failures without retrying the application', async (error) => {
    mocks.post.mockRejectedValue(error)

    await expect(visitorApi.applyToJob({ visitorId: 'visitor-1', jobProfileId: 'job-1' }))
      .rejects.toBe(error)
    expect(mocks.post).toHaveBeenCalledTimes(1)
  })
})