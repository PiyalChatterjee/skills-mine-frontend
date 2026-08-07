import { apiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import type {
  AtsCandidateProfileData,
  MancoDashboardData,
  MandateDetail,
  ManualStageUpdateData,
  ManualStageUpdateRequest,
  PipelineStageUpdateData,
  PipelineStageUpdateRequest,
  RecruiterCandidateSearchData,
  RecruiterDashboardData,
  RecruiterMandatesData,
  RecruiterPerformanceData,
  StageTransitionData,
  SuccessEnvelope,
} from "@/types/api";

export type CreateMandateRequest = {
  companyName: string;
  positionTitle: string;
  location: string;
  fillByDate: string;
  workType: string;
  employmentType: string;
  experienceLevel: string;
  priority: string;
  salary: {
    minimum: number;
    maximum: number;
  };
  jobDescription: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  skills: string[];
  industries: string[];
  jobBoards: string[];
};

export const mandateApi = {
  getRecruiterDashboard() {
    return apiClient
      .get<
        SuccessEnvelope<RecruiterDashboardData>
      >(apiEndpoints.recruiter.dashboard)
      .then((response) => response.data);
  },

  listRecruiterMandates(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient
      .get<
        SuccessEnvelope<RecruiterMandatesData>
      >(apiEndpoints.recruiter.mandates, { params })
      .then((response) => response.data);
  },

  createMandate(payload: CreateMandateRequest) {
    return apiClient
      .post<
        SuccessEnvelope<{ mandateId: string }>
      >(apiEndpoints.recruiter.mandates, payload)
      .then((response) => response.data);
  },

  getMandateDetail(mandateId: string) {
    return apiClient
      .get<
        SuccessEnvelope<MandateDetail>
      >(resolveEndpoint(apiEndpoints.recruiter.mandateDetail, { mandateId }))
      .then((response) => response.data);
  },

  getApplicationStageTransition(applicationId: string) {
    return apiClient
      .get<
        SuccessEnvelope<StageTransitionData>
      >(resolveEndpoint(apiEndpoints.applications.stageTransition, { applicationId }))
      .then((response) => response.data);
  },

  updateApplicationStage(
    applicationId: string,
    payload: ManualStageUpdateRequest,
  ) {
    return apiClient
      .put<
        SuccessEnvelope<ManualStageUpdateData>
      >(resolveEndpoint(apiEndpoints.applications.recruiterStageUpdate, { applicationId }), payload)
      .then((response) => response.data);
  },

  searchCandidates(params?: {
    skill?: string;
    eeStatus?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient
      .get<
        SuccessEnvelope<RecruiterCandidateSearchData>
      >(apiEndpoints.recruiter.candidatesSearch, { params })
      .then((response) => response.data);
  },

  getAtsCandidateProfile(candidateId: string) {
    return apiClient
      .get<
        SuccessEnvelope<AtsCandidateProfileData>
      >(resolveEndpoint(apiEndpoints.recruiter.candidateProfile, { candidateId }))
      .then((response) => response.data);
  },

  advancePipelineStage(
    pipelineId: string,
    payload: PipelineStageUpdateRequest,
  ) {
    return apiClient
      .patch<
        SuccessEnvelope<PipelineStageUpdateData>
      >(resolveEndpoint(apiEndpoints.pipeline.stageUpdate, { pipelineId }), payload)
      .then((response) => response.data);
  },

  getMancoDashboard(mancoId: string, sortedBy?: string) {
    return apiClient
      .get<SuccessEnvelope<MancoDashboardData>>(
        resolveEndpoint(apiEndpoints.manco.dashboard, { mancoId }),
        {
          params: sortedBy ? { sortedBy } : undefined,
        },
      )
      .then((response) => response.data);
  },

  getRecruiterPerformance(recruiterId: string) {
    return apiClient
      .get<
        SuccessEnvelope<RecruiterPerformanceData>
      >(resolveEndpoint(apiEndpoints.manco.recruiterPerformance, { id: recruiterId }))
      .then((response) => response.data);
  },
};
