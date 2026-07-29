import { apiClient } from '@/services/api/axios'
import type { ApiResponse, Job, JobsResponse } from '@/types'

const JOBS_ENDPOINT = import.meta.env.VITE_JOBS_ENDPOINT ?? '/jobs'
const JOBS_QUERY_PARAM = import.meta.env.VITE_JOBS_QUERY_PARAM ?? 'query'
const JOBS_PAGE_PARAM = import.meta.env.VITE_JOBS_PAGE_PARAM ?? 'page'
const JOBS_PAGE_SIZE_PARAM =
  import.meta.env.VITE_JOBS_PAGE_SIZE_PARAM ?? 'pageSize'
const JOBS_LIMIT_PARAM = import.meta.env.VITE_JOBS_LIMIT_PARAM ?? 'limit'

const isJobsResponse = (data: unknown): data is JobsResponse =>
  typeof data === 'object' && data !== null && 'jobs' in data

const isApiResponse = (data: unknown): data is ApiResponse<JobsResponse> =>
  typeof data === 'object' && data !== null && 'data' in data

const toEmptyJobsResponse = (): JobsResponse => ({
  jobs: [],
  total: 0,
  page: 1,
  pageSize: 0,
})

const normalizeJobsResponse = (payload: unknown): JobsResponse => {
  if (isApiResponse(payload)) {
    return normalizeJobsResponse(payload.data)
  }

  if (isJobsResponse(payload) && Array.isArray(payload.jobs)) {
    return {
      jobs: payload.jobs,
      total: typeof payload.total === 'number' ? payload.total : payload.jobs.length,
      page: typeof payload.page === 'number' ? payload.page : 1,
      pageSize:
        typeof payload.pageSize === 'number' ? payload.pageSize : payload.jobs.length,
    }
  }

  if (Array.isArray(payload)) {
    return {
      jobs: payload as Job[],
      total: payload.length,
      page: 1,
      pageSize: payload.length,
    }
  }

  return toEmptyJobsResponse()
}

export const jobsApi = {
  async list(
    searchQuery?: string,
    page = 1,
    pageSize?: number,
  ): Promise<JobsResponse> {
    const normalizedSearchQuery = searchQuery?.trim() ?? ''

    const response = await apiClient.get<ApiResponse<JobsResponse> | JobsResponse | Job[]>(
      JOBS_ENDPOINT,
      {
        params: {
          ...(normalizedSearchQuery
            ? { [JOBS_QUERY_PARAM]: normalizedSearchQuery }
            : {}),
          [JOBS_PAGE_PARAM]: page,
          ...(typeof pageSize === 'number' && pageSize > 0
            ? {
                [JOBS_PAGE_SIZE_PARAM]: pageSize,
                [JOBS_LIMIT_PARAM]: pageSize,
              }
            : {}),
        },
      },
    )

    const payload =
      typeof response.data === 'string'
        ? (JSON.parse(response.data) as ApiResponse<JobsResponse> | JobsResponse | Job[])
        : response.data

    return normalizeJobsResponse(payload)
  },
}
