import { JobPostStatus } from "@/enums/statuses";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { candidateApi, crmApi, excoApi, industryApi, jobsApi, locationApi, mancoApi, adzunaApi } from "@/services/api";
import type { ExcoDashboard } from "@/services/api/excoApi";
import type {
  AddCrmNoteData,
  AddCrmNoteRequest,
  CreateCrmEmployerRequest,
  CrmClientsData,
  CrmClientsParams,
  CrmEmployerDetail,
} from "@/types/api";
import type {
  LowPerformanceAlertPage,
  MancoRecruiterDetail,
  MancoRecruiterListParams,
  MancoRecruiterPage,
  ResolveLowPerformanceAlertResponse,
} from "@/services/api/mancoApi";
import type {
  AdzunaPrefillResponse,
  AdzunaPublishRecord,
  AdzunaJobPublishRecord,
  PublishAdzunaJobRequest,
  UpdateAdzunaJobRequest,
  AdzunaPublishesParams,
} from "@/services/api/adzunaApi";
import { visitorApi } from "@/services/api/visitorApi";
import type { JobsSearchFilters } from "@/services/api/jobsApi";
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
  ApplyJobResponse,
  AiActionsData,
  CandidateLandingData,
  CandidateStatisticsData,
  BuildMyCvData,
  BuildMyCvState,
  GenerateSkillsRequest,
  Job,
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
  filters?: JobsSearchFilters;
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
type UploadCvResumeArgs = {
  candidateId: string;
  file: Blob;
  fileName: string;
  ownerType?: "CANDIDATE" | "VISITOR";
};
type UploadVisitorDocumentArgs = {
  visitorId: string;
  file: Blob;
  fileName: string;
};
type UploadDocumentArgs = {
  candidateId: string;
  file: Blob;
  fileName: string;
  documentType: string;
  ownerType?: "CANDIDATE" | "VISITOR";
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
    "Industries",
    "Locations",
    "MancoRecruiters",
    "MancoAlerts",
    "MancoRecruiterDetail",
    "ExcoDashboard",
    "CrmClients",
    "CrmEmployer",
    "AdzunaPublishes",
    "AdzunaJobs",
  ],
  endpoints: (build) => ({
    getExcoDashboard: build.query<ExcoDashboard, void>({
      queryFn: () => withMappedApiError(() => excoApi.getDashboard()),
      providesTags: ["ExcoDashboard"],
    }),
    getCrmClients: build.query<CrmClientsData, CrmClientsParams>({
      queryFn: (params) => withMappedApiError(() => crmApi.listClients(params)),
      providesTags: ["CrmClients"],
    }),
    getCrmEmployer: build.query<CrmEmployerDetail, string>({
      queryFn: (name) => withMappedApiError(() => crmApi.getEmployerByName(name)),
      providesTags: (_result, _error, name) => [{ type: "CrmEmployer", id: name }],
    }),
    createCrmEmployer: build.mutation<AddCrmNoteData, CreateCrmEmployerRequest>({
      queryFn: (payload) => withMappedApiError(() => crmApi.createEmployer(payload)),
      invalidatesTags: (_result, error) => error ? [] : ["CrmClients", "CrmEmployer"],
    }),
    addCrmClientNote: build.mutation<
      AddCrmNoteData,
      { clientId: string; payload: AddCrmNoteRequest }
    >({
      queryFn: ({ clientId, payload }) =>
        withMappedApiError(() => crmApi.addClientNote(clientId, payload)),
      invalidatesTags: (_result, error) => error ? [] : ["CrmClients", "CrmEmployer"],
    }),
    getIndustries: build.query<string[], void>({
      queryFn: () =>
        withMappedApiError(async () => {
          const envelope = await industryApi.getIndustries();
          const names = envelope.data.map((industry) => industry.name).filter(Boolean);
          // Backend may return multiple records with the same name under different ids
          return Array.from(new Set(names));
        }),
      providesTags: [{ type: "Industries", id: "LIST" }],
    }),
    getLocations: build.query<string[], void>({
      queryFn: () =>
        withMappedApiError(async () => {
          const locations = await locationApi.getLocations();
          return locations.filter(Boolean);
        }),
      providesTags: [{ type: "Locations", id: "LIST" }],
    }),
    getWorkOptions: build.query<string[], void>({
      queryFn: () =>
        withMappedApiError(async () => {
          const locations = await locationApi.getMasterLocations();
          return locations
            .filter((location) => location.type === "WORK_OPTION")
            .map((location) => location.name);
        }),
      providesTags: [{ type: "Locations", id: "WORK_OPTIONS" }],
    }),
    getMancoRecruiters: build.query<
      MancoRecruiterPage,
      MancoRecruiterListParams
    >({
      queryFn: (params) =>
        withMappedApiError(() => mancoApi.listRecruiters(params)),
      providesTags: [{ type: "MancoRecruiters", id: "LIST" }],
    }),
    getMancoLowPerformingRecruiters: build.query<
      LowPerformanceAlertPage,
      void
    >({
      queryFn: () =>
        withMappedApiError(() => mancoApi.listLowPerformingRecruiters()),
      providesTags: [{ type: "MancoAlerts", id: "LIST" }],
    }),
    resolveMancoLowPerformingAlert: build.mutation<
      ResolveLowPerformanceAlertResponse,
      string
    >({
      queryFn: (alertId) =>
        withMappedApiError(() => mancoApi.resolveLowPerformingAlert(alertId)),
      invalidatesTags: [{ type: "MancoAlerts", id: "LIST" }],
    }),
    getMancoRecruiterDetail: build.query<MancoRecruiterDetail, string>({
      queryFn: (recruiterId) =>
        withMappedApiError(() =>
          mancoApi.getRecruiterPerformanceDetail(recruiterId),
        ),
      providesTags: (_result, _error, recruiterId) => [
        { type: "MancoRecruiterDetail", id: recruiterId },
      ],
    }),
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
        ...(args.candidateId && args.candidateId !== args.userId
          ? [{ type: "CandidateProfile" as const, id: args.candidateId }]
          : []),
        { type: "CandidateDashboard", id: "SELF" },
        { type: "UserProfile", id: args.userId },
      ],
    }),
    listJobsPage: build.query<JobsResponse, JobsListArgs>({
      queryFn: ({ searchQuery, page, pageSize, filters }) =>
        withMappedApiError(() => jobsApi.list(searchQuery, page, pageSize, JobPostStatus.POSTED, filters)),
      providesTags: (_result, _error, args) => [
        {
          type: "Jobs",
          id: `${args.searchQuery ?? ""}:${JSON.stringify(args.filters ?? {})}:${args.page}:${args.pageSize}`,
        },
      ],
    }),
    getJobProfile: build.query<Job, string>({
      queryFn: (jobProfileId) =>
        withMappedApiError(() => jobsApi.getJobProfile(jobProfileId)),
      providesTags: (_result, _error, jobProfileId) => [
        { type: "Jobs", id: jobProfileId },
      ],
    }),
    getJobById: build.query<Job, string>({
      queryFn: (jobId) =>
        withMappedApiError(async () => (await jobsApi.getById(jobId)).data),
      providesTags: (_result, _error, jobId) => [{ type: "Jobs", id: jobId }],
    }),
    applyToJob: build.mutation<
      ApplyJobResponse,
      { jobProfileId: string; matchScoreLatest?: number }
    >({
      queryFn: ({ jobProfileId, matchScoreLatest }) =>
        withMappedApiError(() =>
          candidateApi.applyToJob(jobProfileId, { matchScoreLatest }),
        ),
      invalidatesTags: [{ type: "CandidateDashboard", id: "SELF" }],
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
    generateSkills: build.mutation<UserSkill[], GenerateSkillsRequest>({
      queryFn: (payload) =>
        withMappedApiError(() => candidateApi.generateSkills(payload)),
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
      queryFn: ({ candidateId, file, fileName, ownerType }) =>
        withMappedApiError(() =>
          candidateApi.uploadResumeDocument(
            candidateId,
            file,
            fileName,
            ownerType,
          ),
        ),
    }),
    uploadVisitorDocument: build.mutation<
      ResumeDocumentUploadResult,
      UploadVisitorDocumentArgs
    >({
      queryFn: ({ visitorId, file, fileName }) =>
        withMappedApiError(() =>
          visitorApi.uploadDocument(visitorId, file, fileName),
        ),
    }),
    uploadDocument: build.mutation<
      ResumeDocumentUploadResult,
      UploadDocumentArgs
    >({
      queryFn: ({ candidateId, file, fileName, documentType, ownerType }) =>
        withMappedApiError(() =>
          candidateApi.uploadDocument(
            candidateId,
            file,
            fileName,
            documentType,
            ownerType,
          ),
        ),
    }),
    getAdzunaPrefill: build.query<AdzunaPrefillResponse, string>({
      queryFn: (jobProfileId) =>
        withMappedApiError(() => adzunaApi.getAdzunaPrefill(jobProfileId)),
      providesTags: (_result, _error, jobProfileId) => [
        { type: "AdzunaPublishes", id: jobProfileId },
      ],
    }),
    publishToAdzuna: build.mutation<unknown, PublishAdzunaJobRequest>({
      queryFn: (payload) =>
        withMappedApiError(() => adzunaApi.publishToAdzuna(payload)),
      invalidatesTags: (_result, error) =>
        error ? [] : ["AdzunaPublishes", "AdzunaJobs"],
    }),
    getAdzunaJobsAsJson: build.query<AdzunaJobPublishRecord[], void>({
      queryFn: () =>
        withMappedApiError(() => adzunaApi.getAdzunaJobsAsJson()),
      providesTags: ["AdzunaJobs"],
    }),
    updateAdzunaJob: build.mutation<
      unknown,
      { jobId: string; payload: UpdateAdzunaJobRequest }
    >({
      queryFn: ({ jobId, payload }) =>
        withMappedApiError(() => adzunaApi.updateAdzunaJob(jobId, payload)),
      invalidatesTags: (_result, error) =>
        error ? [] : ["AdzunaJobs", "AdzunaPublishes"],
    }),
    deleteAdzunaJob: build.mutation<unknown, string>({
      queryFn: (jobId) =>
        withMappedApiError(() => adzunaApi.deleteAdzunaJob(jobId)),
      invalidatesTags: (_result, error) =>
        error ? [] : ["AdzunaJobs", "AdzunaPublishes"],
    }),
    listAdzunaPublishes: build.query<
      AdzunaPublishRecord[],
      AdzunaPublishesParams | undefined
    >({
      queryFn: (params) =>
        withMappedApiError(() => adzunaApi.listAdzunaPublishes(params)),
      providesTags: ["AdzunaPublishes"],
    }),
  }),
});

export const {
  useGetExcoDashboardQuery,
  useGetCrmClientsQuery,
  useGetCrmEmployerQuery,
  useCreateCrmEmployerMutation,
  useAddCrmClientNoteMutation,
  useGetIndustriesQuery,
  useGetLocationsQuery,
  useGetWorkOptionsQuery,
  useGetMancoRecruitersQuery,
  useGetMancoLowPerformingRecruitersQuery,
  useResolveMancoLowPerformingAlertMutation,
  useGetMancoRecruiterDetailQuery,
  useGetCandidateProfileQuery,
  useGetCandidateDashboardQuery,
  useGetCandidateLandingQuery,
  useGetCandidateStatisticsQuery,
  useUpdateCandidateProfileMutation,
  useListJobsPageQuery,
  useLazyListJobsPageQuery,
  useGetJobProfileQuery,
  useGetJobByIdQuery,
  useApplyToJobMutation,
  useGetUserProfileQuery,
  useSaveJobMutation,
  useRemoveSavedJobMutation,
  useGetSavedJobsQuery,
  useGetRecommendedPositionsQuery,
  useGetCandidateAiActionsQuery,
  useSearchSkillsQuery,
  useGenerateSkillsMutation,
  useGetBuildMyCvQuery,
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
  useCreateSimpleProfileMutation,
  useUploadCvResumeDocumentMutation,
  useUploadVisitorDocumentMutation,
  useUploadDocumentMutation,
  useGetAdzunaPrefillQuery,
  usePublishToAdzunaMutation,
  useGetAdzunaJobsAsJsonQuery,
  useUpdateAdzunaJobMutation,
  useDeleteAdzunaJobMutation,
  useListAdzunaPublishesQuery,
} = apiSlice;
