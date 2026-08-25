import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { candidateApi, jobsApi } from "@/services/api";
import type {
  CandidateDashboardData,
  CandidateDashboardQuery,
  CandidateProfile,
} from "@/modules/candidate/types";
import type { CandidateProfileUpdatePayload } from "@/modules/candidate/types";
import {
  setRecommendedJobs,
  setSavedJobs,
} from "@/store/slices/candidateSlice";
import type {
  ApiError,
  AiActionsData,
  CandidateLandingData,
  CandidateStatisticsData,
  BuildMyCvData,
  BuildMyCvState,
  JobsResponse,
  RecommendedJobsData,
  SavedJobsData,
  SaveJobRequest,
  SaveBuildMyCvRequest,
  SimpleCandidateProfileInput,
  SimpleCandidateProfileResponse,
  ResumeDocumentUploadResult,
  UserProfile,
  UserSkill,
} from "@/types";
import { withMappedApiError } from "@/store/api/queryHelpers";

type JobsListArgs = {
  searchQuery?: string;
  page: number;
  pageSize: number;
};

type CandidateProfileArgs = { candidateId: string; userId?: string };
type CandidateResourceArgs = { candidateId: string };
type CandidateBuildArgs = {
  candidateId: string;
  payload: SaveBuildMyCvRequest;
};
type CreateSimpleProfileArgs = {
  candidateId: string;
  payload: SimpleCandidateProfileInput;
};
type UploadCvResumeArgs = { candidateId: string; file: Blob; fileName: string };
type UploadDocumentArgs = {
  candidateId: string;
  file: Blob;
  fileName: string;
  documentType: string;
};

type UpdateCandidateProfileArgs = {
  userId: string;
  candidateId?: string;
  payload: CandidateProfileUpdatePayload;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: [
    "CandidateProfile",
    "CandidateDashboard",
    "Jobs",
    "UserProfile",
    "Skills",
    "BuildMyCv",
    "SavedJobs",
    "RecommendedPositions",
    "CandidateLanding",
    "CandidateStatistics",
    "AiActions",
  ],
  endpoints: (build) => ({
    getCandidateProfile: build.query<CandidateProfile, CandidateProfileArgs>({
      queryFn: async ({ candidateId, userId }, api) =>
        withMappedApiError(async () => {
          const profile = await candidateApi.getById(candidateId, userId);
          api.dispatch(setSavedJobs(profile.savedJobs ?? []));
          api.dispatch(setRecommendedJobs(profile.recommendedJobs ?? []));
          return profile;
        }),
      providesTags: (_result, _error, args) => [
        { type: "CandidateProfile", id: args.candidateId },
      ],
    }),
    getCandidateDashboard: build.query<
      CandidateDashboardData,
      CandidateDashboardQuery | void
    >({
      queryFn: (query) =>
        withMappedApiError(async () => {
          return candidateApi.getDashboard(query ?? {});
        }),
      providesTags: [{ type: "CandidateDashboard", id: "SELF" }],
    }),
    getCandidateLanding: build.query<CandidateLandingData, void>({
      queryFn: () => withMappedApiError(() => candidateApi.getLanding()),
      providesTags: [{ type: "CandidateLanding", id: "PUBLIC" }],
    }),
    getCandidateStatistics: build.query<CandidateStatisticsData, void>({
      queryFn: () => withMappedApiError(() => candidateApi.getStatistics()),
      providesTags: [{ type: "CandidateStatistics", id: "SELF" }],
    }),
    updateCandidateProfile: build.mutation<
      CandidateProfile,
      UpdateCandidateProfileArgs
    >({
      queryFn: ({ userId, candidateId, payload }) =>
        withMappedApiError(() =>
          candidateApi.updateById(candidateId ?? userId, payload),
        ),
      invalidatesTags: (_result, _error, args) => [
        { type: "CandidateProfile", id: args.userId },
        { type: "CandidateDashboard", id: "SELF" },
        { type: "UserProfile", id: args.userId },
      ],
    }),
    listJobsPage: build.query<JobsResponse, JobsListArgs>({
      queryFn: ({ searchQuery, page, pageSize }) =>
        withMappedApiError(() => jobsApi.list(searchQuery, page, pageSize)),
      providesTags: (_result, _error, args) => [
        {
          type: "Jobs",
          id: `${args.searchQuery ?? ""}:${args.page}:${args.pageSize}`,
        },
      ],
    }),
    getUserProfile: build.query<UserProfile, string>({
      queryFn: (userId) =>
        withMappedApiError(() => candidateApi.getUserProfile(userId)),
      providesTags: (_result, _error, userId) => [
        { type: "UserProfile", id: userId },
      ],
    }),
    saveJob: build.mutation<unknown, SaveJobRequest>({
      queryFn: (payload) =>
        withMappedApiError(async () => {
          await candidateApi.saveJob(payload);
          return undefined;
        }),
      invalidatesTags: [{ type: "SavedJobs" }],
    }),
    removeSavedJob: build.mutation<
      unknown,
      CandidateResourceArgs & { jobProfileId: string }
    >({
      queryFn: ({ candidateId, jobProfileId }) =>
        withMappedApiError(() =>
          candidateApi.removeSavedJob(candidateId, jobProfileId),
        ),
      invalidatesTags: (_result, _error, args) => [
        { type: "SavedJobs", id: args.candidateId },
      ],
    }),
    getSavedJobs: build.query<SavedJobsData, CandidateResourceArgs>({
      queryFn: ({ candidateId }) =>
        withMappedApiError(() => candidateApi.getSavedJobs(candidateId)),
      providesTags: (_result, _error, args) => [
        { type: "SavedJobs", id: args.candidateId },
      ],
    }),
    getRecommendedPositions: build.query<
      RecommendedJobsData,
      CandidateResourceArgs
    >({
      queryFn: ({ candidateId }) =>
        withMappedApiError(() =>
          candidateApi.getRecommendedPositions(candidateId),
        ),
      providesTags: (_result, _error, args) => [
        { type: "RecommendedPositions", id: args.candidateId },
      ],
    }),
    getCandidateAiActions: build.query<AiActionsData, CandidateResourceArgs>({
      queryFn: ({ candidateId }) =>
        withMappedApiError(() => candidateApi.getAiActions(candidateId)),
      providesTags: (_result, _error, args) => [
        { type: "AiActions", id: args.candidateId },
      ],
    }),
    searchSkills: build.query<
      UserSkill[],
      { keyword: string; userId?: string }
    >({
      queryFn: ({ keyword, userId }) =>
        withMappedApiError(() => candidateApi.searchSkills(keyword, userId)),
      providesTags: (_result, _error, args) => [
        { type: "Skills", id: args.keyword },
      ],
    }),
    getBuildMyCv: build.query<BuildMyCvState, CandidateResourceArgs>({
      queryFn: ({ candidateId }) =>
        withMappedApiError(() => candidateApi.getBuildMyCv(candidateId)),
      providesTags: (_result, _error, args) => [
        { type: "BuildMyCv", id: args.candidateId },
      ],
    }),
    saveBuildMyCv: build.mutation<BuildMyCvData, CandidateBuildArgs>({
      queryFn: ({ candidateId, payload }) =>
        withMappedApiError(() =>
          candidateApi.saveBuildMyCv(candidateId, payload),
        ),
      invalidatesTags: (_result, _error, args) => [
        { type: "BuildMyCv", id: args.candidateId },
      ],
    }),
    updateBuildMyCv: build.mutation<BuildMyCvData, CandidateBuildArgs>({
      queryFn: ({ candidateId, payload }) =>
        withMappedApiError(() =>
          candidateApi.updateBuildMyCv(candidateId, payload),
        ),
      invalidatesTags: (_result, _error, args) => [
        { type: "BuildMyCv", id: args.candidateId },
      ],
    }),
    createSimpleProfile: build.mutation<
      SimpleCandidateProfileResponse,
      CreateSimpleProfileArgs
    >({
      queryFn: ({ candidateId, payload }) =>
        withMappedApiError(() =>
          candidateApi.createSimpleProfile(candidateId, payload),
        ),
      invalidatesTags: (_result, _error, args) => [
        { type: "CandidateProfile", id: args.candidateId },
      ],
    }),
    uploadCvResumeDocument: build.mutation<
      ResumeDocumentUploadResult,
      UploadCvResumeArgs
    >({
      queryFn: ({ candidateId, file, fileName }) =>
        withMappedApiError(() =>
          candidateApi.uploadResumeDocument(candidateId, file, fileName),
        ),
    }),
    uploadDocument: build.mutation<
      ResumeDocumentUploadResult,
      UploadDocumentArgs
    >({
      queryFn: ({ candidateId, file, fileName, documentType }) =>
        withMappedApiError(() =>
          candidateApi.uploadDocument(
            candidateId,
            file,
            fileName,
            documentType,
          ),
        ),
    }),
  }),
});

export const {
  useGetCandidateProfileQuery,
  useGetCandidateDashboardQuery,
  useGetCandidateLandingQuery,
  useGetCandidateStatisticsQuery,
  useUpdateCandidateProfileMutation,
  useLazyListJobsPageQuery,
  useGetUserProfileQuery,
  useSaveJobMutation,
  useRemoveSavedJobMutation,
  useGetSavedJobsQuery,
  useGetRecommendedPositionsQuery,
  useGetCandidateAiActionsQuery,
  useSearchSkillsQuery,
  useGetBuildMyCvQuery,
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
  useCreateSimpleProfileMutation,
  useUploadCvResumeDocumentMutation,
  useUploadDocumentMutation,
} = apiSlice;
