import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useJobs } from './useJobs'
import type { JobsResponse } from '@/types'

const mocks = vi.hoisted(() => ({
  triggerPage: vi.fn(),
  triggerState: { isError: false, error: null },
}))

vi.mock('@/store/api/apiSlice', () => ({
  useLazyListJobsPageQuery: () => [mocks.triggerPage, mocks.triggerState],
}))

const makePage = (jobIds: string[], total = jobIds.length, pageSize = 2): JobsResponse => ({
  jobs: jobIds.map((jobId) => ({
    jobId,
    title: `Job ${jobId}`,
    company: 'Acme',
    location: 'Cape Town',
    industry: 'Technology',
    employmentType: 'Permanent',
    workType: 'Remote',
    salaryRange: 'Negotiable',
    description: 'Description',
    requirements: [],
    responsibilities: [],
    status: 'Open',
    applicationCount: 0,
    postedDate: '2026-01-01',
  })),
  total,
  page: 1,
  pageSize,
})

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.triggerState.isError = false
    mocks.triggerState.error = null
    mocks.triggerPage.mockImplementation(() => ({
      unwrap: () => Promise.resolve(makePage(['job-1', 'job-2'], 3)),
    }))
  })

  it('loads the first page when enabled and reports another page', async () => {
    const { result } = renderHook(() => useJobs('engineer', true, 2))

    await waitFor(() => {
      expect(result.current.data.pages).toHaveLength(1)
    })

    expect(mocks.triggerPage).toHaveBeenCalledWith(
      { searchQuery: 'engineer', page: 1, pageSize: 2 },
      true,
    )
    expect(result.current.hasNextPage).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches the next page once and appends it', async () => {
    mocks.triggerPage
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve(makePage(['job-1', 'job-2'], 4)),
      }))
      .mockImplementationOnce(() => ({
        unwrap: () => Promise.resolve({ ...makePage(['job-3', 'job-4'], 4), page: 2 }),
      }))

    const { result } = renderHook(() => useJobs(undefined, true, 2))
    await waitFor(() => expect(result.current.data.pages).toHaveLength(1))

    await act(async () => {
      await result.current.fetchNextPage()
    })

    expect(mocks.triggerPage).toHaveBeenLastCalledWith(
      { searchQuery: undefined, page: 2, pageSize: 2 },
      true,
    )
    expect(result.current.data.pages).toHaveLength(2)
    expect(result.current.hasNextPage).toBe(false)
  })

  it('does not request pages when disabled', async () => {
    const { result } = renderHook(() => useJobs('engineer', false, 2))

    await act(async () => {
      await result.current.fetchNextPage()
    })

    expect(mocks.triggerPage).not.toHaveBeenCalled()
    expect(result.current.data.pages).toEqual([])
    expect(result.current.hasNextPage).toBe(false)
  })
})
