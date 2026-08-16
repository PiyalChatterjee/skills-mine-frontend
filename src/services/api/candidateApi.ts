import {
  apiClient,
  unwrapEnvelopeData,
  unwrapResponseData,
} from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import type {
  BuildMyCvData,
  BuildMyCvState,
  CandidateApplication,
  CandidateDashboardData,
  CandidateProfile,
  CandidateProfileResponse,
  CvDownloadData,
  CvPreviewData,
  CvUploadData,
  RecommendedJobsData,
  SaveBuildMyCvRequest,
  UpdateBuildMyCvRequest,
  SuccessEnvelope,
  UserProfile,
  UserSkill,
} from "@/types/api";
import type { CandidateProfileUpdatePayload } from "@/modules/candidate/types";

const isUserSkill = (value: unknown): value is UserSkill => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const skill = value as Partial<UserSkill>;
  return (
    typeof skill.skillId === "string" && typeof skill.skillName === "string"
  );
};

const normalizeSkillsResponse = (payload: unknown): UserSkill[] => {
  const toSkillsArray = (value: unknown): UserSkill[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(isUserSkill).map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      selected: Boolean(skill.selected),
      ...(skill.userId ? { userId: skill.userId } : {}),
    }));
  };

  if (Array.isArray(payload)) {
    return toSkillsArray(payload);
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const maybeEnvelope = payload as {
    data?: unknown;
    skills?: unknown;
    results?: unknown;
    items?: unknown;
  };

  const candidates = [
    maybeEnvelope.data,
    maybeEnvelope.skills,
    maybeEnvelope.results,
    maybeEnvelope.items,
  ];

  for (const candidate of candidates) {
    const normalized = toSkillsArray(candidate);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return [];
};

const isCandidateApplication = (
  value: unknown,
): value is CandidateApplication => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CandidateApplication>;
  return (
    typeof candidate.applicationId === "string" &&
    typeof candidate.candidateId === "string" &&
    typeof candidate.jobId === "string" &&
    typeof candidate.jobTitle === "string" &&
    typeof candidate.company === "string" &&
    typeof candidate.currentStage === "string" &&
    typeof candidate.appliedDate === "string" &&
    typeof candidate.matchScore === "number" &&
    typeof candidate.isGuest === "boolean"
  );
};

const mapProfileResponse = (
  payload: CandidateProfileResponse,
): CandidateProfile => {
  const desiredJob = payload.data.desiredJob as CandidateProfileResponse["data"]["desiredJob"] & {
    jobType?: string;
    industries?: string[];
    locations?: string[];
    currency?: string;
  };

  return {
    userId: payload.data.userId ?? payload.data.personalDetails.userId,
    personalDetails: {
      firstName: payload.data.personalDetails.firstName,
      lastName: payload.data.personalDetails.lastName,
      email: payload.data.personalDetails.email,
      mobileNumber: payload.data.personalDetails.mobileNumber,
      location: payload.data.personalDetails.location,
      nationality: payload.data.personalDetails.nationality,
      idNumber: payload.data.personalDetails.idNumber,
      eeStatus: payload.data.personalDetails.eeStatus,
      profileImageUrl: payload.data.personalDetails.profileImageUrl,
      thumbnailUrl: payload.data.personalDetails.thumbnailUrl,
      linkedinUrl: payload.data.personalDetails.linkedinUrl,
      portfolioUrl: payload.data.personalDetails.portfolioUrl,
    },
    desiredJob: {
      jobTitle: desiredJob.jobTitle,
      industry: desiredJob.industry ?? desiredJob.industries?.join(", ") ?? "",
      workType: desiredJob.workType ?? desiredJob.locations?.join(", ") ?? "",
      employmentType: desiredJob.employmentType ?? desiredJob.jobType ?? "",
      salaryExpectation: desiredJob.salaryExpectation,
      currency: desiredJob.currency,
      industries: desiredJob.industries,
      locations: desiredJob.locations,
      jobType: desiredJob.jobType,
      availableFrom: desiredJob.availableFrom,
    },
    education: payload.data.education ?? null,
    experience: payload.data.experience,
    skills: payload.data.skills ?? [],
    languages: payload.data.languages ?? [],
    authentication: payload.data.authentication ?? null,
  };
};

export const candidateApi = {
  async getById(userId: string): Promise<CandidateProfile> {
    const payload = await unwrapResponseData(
      apiClient.get<CandidateProfileResponse>(
        resolveEndpoint(apiEndpoints.users.profile, { userId }),
      ),
    );
    return mapProfileResponse(payload);
  },

  async updateById(
    userId: string,
    payload: CandidateProfileUpdatePayload,
  ): Promise<CandidateProfile> {
    await apiClient.put<SuccessEnvelope<{ userId: string; updatedAt: string }>>(
      resolveEndpoint(apiEndpoints.users.profile, { userId }),
      payload,
    );
    return this.getById(userId);
  },

  uploadProfilePhoto(
    userId: string,
    file: File,
  ): Promise<
    SuccessEnvelope<{ profileImageUrl: string; thumbnailUrl: string }>
  > {
    const formData = new FormData();
    formData.append("file", file);
    return unwrapResponseData(
      apiClient.post(
        resolveEndpoint(apiEndpoints.users.profilePhoto, { userId }),
        formData,
      ),
    );
  },

  deleteProfilePhoto(userId: string): Promise<SuccessEnvelope<null>> {
    return unwrapResponseData(
      apiClient.delete(resolveEndpoint(apiEndpoints.users.profilePhoto, { userId })),
    );
  },

  getDashboard(
    userId: string,
  ): Promise<SuccessEnvelope<CandidateDashboardData>> {
    return unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.dashboard, { userId })),
    );
  },

  buildMyCv(): Promise<SuccessEnvelope<BuildMyCvData>> {
    return unwrapResponseData(apiClient.post(apiEndpoints.candidate.buildMyCv));
  },

  previewResume(resumeId: string): Promise<SuccessEnvelope<CvPreviewData>> {
    return unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.resumePreview, { resumeId })),
    );
  },

  downloadResume(resumeId: string): Promise<SuccessEnvelope<CvDownloadData>> {
    return unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.resumeDownload, { resumeId })),
    );
  },

  uploadApplicationCv(
    applicationId: string,
    file: File,
  ): Promise<SuccessEnvelope<CvUploadData>> {
    const formData = new FormData();
    formData.append("file", file);
    return unwrapResponseData(
      apiClient.post(
        resolveEndpoint(apiEndpoints.applications.cvUpload, { applicationId }),
        formData,
      ),
    );
  },

  getRecommendedJobs(
    candidateId: string,
  ): Promise<SuccessEnvelope<RecommendedJobsData>> {
    return unwrapResponseData(
      apiClient.get(
        resolveEndpoint(apiEndpoints.candidate.recommendedJobs, {
          candidateId,
        }),
      ),
    );
  },

  getApplicationById(applicationId: string): Promise<CandidateApplication> {
    return unwrapResponseData(
      apiClient.get<
        SuccessEnvelope<unknown> | CandidateApplication
      >(resolveEndpoint(apiEndpoints.applications.stageTransition, { applicationId })),
    ).then((payload) => {
      if (isCandidateApplication(payload)) {
        return payload;
      }

      const envelope = payload as SuccessEnvelope<unknown>;
      if (isCandidateApplication(envelope.data)) {
        return envelope.data;
      }

      throw new Error("Unexpected application response shape");
    });
  },

  getUserProfile(userId: string): Promise<UserProfile> {
    return unwrapEnvelopeData(
      apiClient.get<SuccessEnvelope<UserProfile>>(
        resolveEndpoint(apiEndpoints.users.profile, { userId }),
      ),
    );
  },

  async updateUserProfile(
    userId: string,
    payload: Partial<UserProfile>,
  ): Promise<UserProfile> {
    await apiClient.put<SuccessEnvelope<{ userId: string; updatedAt: string }>>(
      resolveEndpoint(apiEndpoints.users.profile, { userId }),
      payload,
    );
    return this.getUserProfile(userId);
  },

  searchSkills(keyword: string, userId?: string): Promise<UserSkill[]> {
    return unwrapResponseData(
      apiClient.get<SuccessEnvelope<unknown> | unknown>(apiEndpoints.skills.search, {
        params: {
          [apiEndpoints.skills.keywordParam]: keyword,
          ...(userId ? { userId } : {}),
        }
      }),
    ).then((payload) => normalizeSkillsResponse(payload));
  },

  getBuildMyCv(): Promise<BuildMyCvState> {
    return unwrapEnvelopeData(
      apiClient.get<SuccessEnvelope<BuildMyCvState>>(apiEndpoints.candidate.buildMyCv),
    );
  },

  saveBuildMyCv(payload: SaveBuildMyCvRequest): Promise<BuildMyCvData> {
    return unwrapEnvelopeData(
      apiClient.post<SuccessEnvelope<BuildMyCvData>>(
        apiEndpoints.candidate.buildMyCv,
        payload,
      ),
    );
  },

  updateBuildMyCv(payload: UpdateBuildMyCvRequest): Promise<BuildMyCvData> {
    return unwrapEnvelopeData(
      apiClient.put<SuccessEnvelope<BuildMyCvData>>(
        apiEndpoints.candidate.buildMyCv,
        payload,
      ),
    );
  },
};
