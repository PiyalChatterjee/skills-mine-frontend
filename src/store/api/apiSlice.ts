import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { candidateApi, jobsApi } from '@/services/api'
import type { CandidateApplication, CandidateProfile } from '@/modules/candidate/types'
import type { CandidateProfileUpdatePayload } from '@/services/api/candidateApi'
import type { ApiError, JobsResponse } from '@/types'
import { withMappedApiError } from '@/store/api/queryHelpers'

type JobsListArgs = {
  searchQuery?: string
  page: number
  pageSize: number
}

type UpdateCandidateProfileArgs = {
  candidateId: string
  payload: CandidateProfileUpdatePayload
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['CandidateProfile', 'CandidateApplications', 'Jobs'],
  endpoints: (build) => ({
    getCandidateProfile: build.query<CandidateProfile, string>({
      queryFn: (candidateId) => withMappedApiError(() => candidateApi.getById(candidateId)),
      providesTags: (_result, _error, candidateId) => [
        { type: 'CandidateProfile', id: candidateId },
      ],
    }),
    getCandidateApplications: build.query<CandidateApplication[], string[]>({
      queryFn: (applicationIds) =>
        withMappedApiError(() =>
          Promise.all(
            applicationIds.filter(Boolean).map((id) => candidateApi.getApplicationById(id)),
          ),
        ),
      providesTags: (_result, _error, applicationIds) => [
        ...applicationIds.map((id) => ({ type: 'CandidateApplications' as const, id })),
        { type: 'CandidateApplications' as const, id: 'LIST' },
      ],
    }),
    updateCandidateProfile: build.mutation<CandidateProfile, UpdateCandidateProfileArgs>({
      queryFn: ({ candidateId, payload }) =>
        withMappedApiError(() => candidateApi.updateById(candidateId, payload)),
      invalidatesTags: (_result, _error, args) => [
        { type: 'CandidateProfile', id: args.candidateId },
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
  useGetCandidateApplicationsQuery,
  useUpdateCandidateProfileMutation,
  useLazyListJobsPageQuery,
} = apiSlice
