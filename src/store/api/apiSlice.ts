import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { candidateApi, jobsApi } from '@/services/api'
import type { CandidateDashboardData, CandidateProfile } from '@/modules/candidate/types'
import type { CandidateProfileUpdatePayload } from '@/modules/candidate/types'
import type { ApiError, JobsResponse } from '@/types'
import { withMappedApiError } from '@/store/api/queryHelpers'

type JobsListArgs = {
  searchQuery?: string
  page: number
  pageSize: number
}

type UpdateCandidateProfileArgs = {
  userId: string
  payload: CandidateProfileUpdatePayload
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['CandidateProfile', 'CandidateDashboard', 'Jobs'],
  endpoints: (build) => ({
    getCandidateProfile: build.query<CandidateProfile, string>({
      queryFn: (userId) => withMappedApiError(() => candidateApi.getById(userId)),
      providesTags: (_result, _error, userId) => [
        { type: 'CandidateProfile', id: userId },
      ],
    }),
    getCandidateDashboard: build.query<CandidateDashboardData, string>({
      queryFn: (userId) =>
        withMappedApiError(async () => {
          const response = await candidateApi.getDashboard(userId)
          return response.data
        }),
      providesTags: [{ type: 'CandidateDashboard', id: 'SELF' }],
    }),
    updateCandidateProfile: build.mutation<CandidateProfile, UpdateCandidateProfileArgs>({
      queryFn: ({ userId, payload }) =>
        withMappedApiError(() => candidateApi.updateById(userId, payload)),
      invalidatesTags: (_result, _error, args) => [
        { type: 'CandidateProfile', id: args.userId },
        { type: 'CandidateDashboard', id: 'SELF' },
      ],
    }),
    listJobsPage: build.query<JobsResponse, JobsListArgs>({
      queryFn: ({ searchQuery, page, pageSize }) =>
        withMappedApiError(() => jobsApi.list(searchQuery, page, pageSize)),
      providesTags: (_result, _error, args) => [
        {
          type: 'Jobs',
          id: `${args.searchQuery ?? ''}:${args.page}:${args.pageSize}`,
        },
      ],
    }),
  }),
})

export const {
  useGetCandidateProfileQuery,
  useGetCandidateDashboardQuery,
  useUpdateCandidateProfileMutation,
  useLazyListJobsPageQuery,
} = apiSlice
