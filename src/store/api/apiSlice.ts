import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { candidateApi, jobsApi } from '@/services/api'
import type { CandidateDashboardData, CandidateProfile } from '@/modules/candidate/types'
import type { CandidateProfileUpdatePayload } from '@/modules/candidate/types'
import type { ApiError, BuildMyCvData, BuildMyCvState, JobsResponse, SaveBuildMyCvRequest, UpdateBuildMyCvRequest, UserProfile, UserSkill } from '@/types'
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
  tagTypes: ['CandidateProfile', 'CandidateDashboard', 'Jobs', 'UserProfile', 'Skills', 'BuildMyCv'],
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
        { type: 'UserProfile', id: args.userId },
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
    getUserProfile: build.query<UserProfile, string>({
      queryFn: (userId) => withMappedApiError(() => candidateApi.getUserProfile(userId)),
      providesTags: (_result, _error, userId) => [{ type: 'UserProfile', id: userId }],
    }),
    saveJob: build.mutation<{ success: boolean }, string>({
      queryFn: (jobId) => withMappedApiError(() => jobsApi.save(jobId)),
      // invalidate UserProfile so savedJobs list refetches
      invalidatesTags: () => [{ type: 'UserProfile', id: 'SELF' }],
    }),
    searchSkills: build.query<UserSkill[], { keyword: string; userId?: string }>({
      queryFn: ({ keyword, userId }) =>
        withMappedApiError(() => candidateApi.searchSkills(keyword, userId)),
      providesTags: (_result, _error, args) => [
        { type: 'Skills', id: args.keyword },
      ],
    }),
    getBuildMyCv: build.query<BuildMyCvState, void>({
      queryFn: () => withMappedApiError(() => candidateApi.getBuildMyCv()),
      providesTags: [{ type: 'BuildMyCv', id: 'SELF' }],
    }),
    saveBuildMyCv: build.mutation<BuildMyCvData, SaveBuildMyCvRequest>({
      queryFn: (payload) => withMappedApiError(() => candidateApi.saveBuildMyCv(payload)),
      invalidatesTags: [{ type: 'BuildMyCv', id: 'SELF' }],
    }),
    updateBuildMyCv: build.mutation<BuildMyCvData, UpdateBuildMyCvRequest>({
      queryFn: (payload) => withMappedApiError(() => candidateApi.updateBuildMyCv(payload)),
      invalidatesTags: [{ type: 'BuildMyCv', id: 'SELF' }],
    }),
  }),
})

export const {
  useGetCandidateProfileQuery,
  useGetCandidateDashboardQuery,
  useUpdateCandidateProfileMutation,
  useLazyListJobsPageQuery,
  useGetUserProfileQuery,
  useSaveJobMutation,
  useSearchSkillsQuery,
  useGetBuildMyCvQuery,
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
} = apiSlice
