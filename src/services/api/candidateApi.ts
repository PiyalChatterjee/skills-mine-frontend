import { apiClient } from "@/services/api/axios";
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
): CandidateProfile => ({
  userId: payload.data.personalDetails.userId,
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
  desiredJob: payload.data.desiredJob,
  education: payload.data.education,
  experience: payload.data.experience,
  skills: payload.data.skills ?? [],
  languages: payload.data.languages ?? [],
});

export const candidateApi = {
  async getById(userId: string): Promise<CandidateProfile> {
    const response = await apiClient.get<CandidateProfileResponse>(
      resolveEndpoint(apiEndpoints.users.profile, { userId }),
    );
    return mapProfileResponse(response.data);
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
    return apiClient
      .post(
        resolveEndpoint(apiEndpoints.users.profilePhoto, { userId }),
        formData,
      )
      .then((response) => response.data);
  },

  deleteProfilePhoto(userId: string): Promise<SuccessEnvelope<null>> {
    return apiClient
      .delete(resolveEndpoint(apiEndpoints.users.profilePhoto, { userId }))
      .then((response) => response.data);
  },

  getDashboard(
    userId: string,
  ): Promise<SuccessEnvelope<CandidateDashboardData>> {
    return apiClient
      .get(resolveEndpoint(apiEndpoints.candidate.dashboard, { userId }))
      .then((response) => response.data);
  },

  buildMyCv(): Promise<SuccessEnvelope<BuildMyCvData>> {
    return apiClient
      .post(apiEndpoints.candidate.buildMyCv)
      .then((response) => response.data);
  },

  previewResume(resumeId: string): Promise<SuccessEnvelope<CvPreviewData>> {
    return apiClient
      .get(resolveEndpoint(apiEndpoints.candidate.resumePreview, { resumeId }))
      .then((response) => response.data);
  },

  downloadResume(resumeId: string): Promise<SuccessEnvelope<CvDownloadData>> {
    return apiClient
      .get(resolveEndpoint(apiEndpoints.candidate.resumeDownload, { resumeId }))
      .then((response) => response.data);
  },

  uploadApplicationCv(
    applicationId: string,
    file: File,
  ): Promise<SuccessEnvelope<CvUploadData>> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post(
        resolveEndpoint(apiEndpoints.applications.cvUpload, { applicationId }),
        formData,
      )
      .then((response) => response.data);
  },

  getRecommendedJobs(
    candidateId: string,
  ): Promise<SuccessEnvelope<RecommendedJobsData>> {
    return apiClient
      .get(
        resolveEndpoint(apiEndpoints.candidate.recommendedJobs, {
          candidateId,
        }),
      )
      .then((response) => response.data);
  },

  getApplicationById(applicationId: string): Promise<CandidateApplication> {
    return apiClient
      .get<
        SuccessEnvelope<unknown> | CandidateApplication
      >(resolveEndpoint(apiEndpoints.applications.stageTransition, { applicationId }))
      .then((response) => {
        if (isCandidateApplication(response.data)) {
          return response.data;
        }

        const envelope = response.data as SuccessEnvelope<unknown>;
        if (isCandidateApplication(envelope.data)) {
          return envelope.data;
        }

        throw new Error("Unexpected application response shape");
      });
  },

  getUserProfile(userId: string): Promise<UserProfile> {
    return apiClient
      .get<
        SuccessEnvelope<UserProfile>
      >(resolveEndpoint(apiEndpoints.users.profile, { userId }))
      .then((response) => response.data.data);
  },

  searchSkills(keyword: string, userId?: string): Promise<UserSkill[]> {
    return apiClient
      .get<SuccessEnvelope<unknown> | unknown>(apiEndpoints.skills.search, {
        params: {
          [apiEndpoints.skills.keywordParam]: keyword,
          ...(userId ? { userId } : {}),
        },
      })
      .then((response) => normalizeSkillsResponse(response.data));
  },

  getBuildMyCv(): Promise<BuildMyCvState> {
    return apiClient
      .get<SuccessEnvelope<BuildMyCvState>>(apiEndpoints.candidate.buildMyCv)
      .then((response) => response.data.data);
  },

  saveBuildMyCv(payload: SaveBuildMyCvRequest): Promise<BuildMyCvData> {
    return apiClient
      .post<
        SuccessEnvelope<BuildMyCvData>
      >(apiEndpoints.candidate.buildMyCv, payload)
      .then((response) => response.data.data);
  },

  updateBuildMyCv(payload: UpdateBuildMyCvRequest): Promise<BuildMyCvData> {
    return apiClient
      .put<
        SuccessEnvelope<BuildMyCvData>
      >(apiEndpoints.candidate.buildMyCv, payload)
      .then((response) => response.data.data);
  },
};
