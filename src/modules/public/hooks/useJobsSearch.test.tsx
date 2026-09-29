import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useJobsSearch } from './useJobsSearch'

const mocks = vi.hoisted(() => ({
  useJobs: vi.fn(),
}))

vi.mock('./useJobs', () => ({
  useJobs: mocks.useJobs,
}))

const firstJob = {
  jobId: 'job-1',
  title: 'Frontend Engineer',
  company: 'Acme',
  location: 'Cape Town',
  industry: 'Technology',
  employmentType: 'Permanent',
  workType: 'Remote',
  description: 'Build UI',
}

const secondJob = {
  ...firstJob,
  jobId: 'job-2',
  title: 'Product Designer',
}

describe('useJobsSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useJobs.mockReturnValue({
      data: {
        pages: [
          { jobs: [firstJob, secondJob] },
          { jobs: [firstJob] },
        ],
      },
      isError: false,
      error: null,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      isLoading: false,
    })
  })

  it('deduplicates jobs across pages by job ID', () => {
    const { result } = renderHook(() => useJobsSearch({
      normalizedSearchTerm: '',
      shouldFilter: false,
      shouldUseDebouncedQuery: false,
      debouncedSearchTerm: '',
    }))

    expect(result.current.allJobs.map((job) => job.jobId)).toEqual(['job-1', 'job-2'])
    expect(result.current.visibleJobs).toHaveLength(2)
  })

  it('filters visible jobs by normalized title while preserving the full collection', () => {
    const { result } = renderHook(() => useJobsSearch({
      normalizedSearchTerm: 'designer',
      shouldFilter: true,
      shouldUseDebouncedQuery: true,
      debouncedSearchTerm: 'designer',
    }))

    expect(mocks.useJobs).toHaveBeenCalledWith('designer', true, expect.any(Number))
    expect(result.current.allJobs).toHaveLength(2)
    expect(result.current.visibleJobs).toEqual([secondJob])
  })

  it('passes through loading and API error state', () => {
    mocks.useJobs.mockReturnValue({
      data: { pages: [] },
      isError: true,
      error: { message: 'Jobs unavailable' },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: vi.fn(),
      isLoading: true,
    })

    const { result } = renderHook(() => useJobsSearch({
      normalizedSearchTerm: '',
      shouldFilter: false,
      shouldUseDebouncedQuery: false,
      debouncedSearchTerm: '',
    }))

    expect(result.current.isJobsError).toBe(true)
    expect(result.current.jobsError).toEqual({ message: 'Jobs unavailable' })
    expect(result.current.isJobsLoading).toBe(true)
  })
})
