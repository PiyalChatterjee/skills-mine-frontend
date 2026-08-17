import {
  apiClient,
  unwrapEnvelopeData,
  unwrapResponseData,
} from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import type {
  BuildMyCvData,
  BuildMyCvState,
  AiActionsData,
  CandidateLandingData,
  CandidateApplication,
  CandidateDashboardData,
  CandidateDashboardQuery,
  CandidateProfile,
  CandidateProfileResponse,
  CvDownloadData,
  CvPreviewData,
  CvUploadData,
  RecommendedJobsData,
  SavedJobsData,
  SaveJobRequest,
  SaveBuildMyCvRequest,
  SimpleCandidateProfileInput,
  SimpleCandidateProfileResponse,
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

const responseData = <T>(payload: T | { data?: T }): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    ("success" in payload ||
      "statusCode" in payload ||
      "message" in payload ||
      "status" in payload)
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
};

const mapDashboardResponse = (payload: unknown): CandidateDashboardData => {
  const data = responseData(payload as Record<string, unknown>) as Record<string, unknown>;
  const applications = Array.isArray(data.applications) ? data.applications : [];
  const normalizedApplications = applications.map((item) => {
    const application = item as Record<string, any>;
    const progress = Array.isArray(application.stage_progress)
      ? application.stage_progress
      : application.pipeline;
    return {
      id: application.id ?? application.application_id,
      job: application.job ?? {
        id: application.job_id ?? application.job_profile_id ?? "",
        title: application.job_title ?? "",
        company: application.company_name ?? "",
      },
      stage: application.stage ?? application.current_stage,
      statusMessage: application.statusMessage ?? application.message ?? "",
      pipeline: Array.isArray(progress)
        ? progress.map((stage: Record<string, string> | string) =>
            typeof stage === "string"
              ? stage
              : stage.stage_code ?? stage.display_name ?? "",
          )
        : [],
    };
  });
  const summary = (data.summary ?? {}) as Record<string, number>;
  const statuses = applications.map((item) => String((item as Record<string, unknown>).application_status ?? ""));

  return {
    id: String(data.id ?? ""),
    candidateId: data.candidateId as string | undefined ?? data.candidate_id as string | undefined,
    summary: {
      totalApplications: summary.totalApplications ?? normalizedApplications.length,
      submitted: summary.submitted ?? statuses.filter((status) => status === "SUBMITTED").length,
      inProgress: summary.inProgress ?? statuses.filter((status) => ["ACTIVE", "SUBMITTED", "ON_HOLD"].includes(status)).length,
      successful: summary.successful ?? 0,
    },
    activity: (data.activity ?? {
      jobsAppliedThisWeek: 0,
      recruiterProfileViewsThisWeek: 0,
      coursesCompletedThisWeek: 0,
    }) as CandidateDashboardData["activity"],
    applications: normalizedApplications,
    quickLinks: (data.quickLinks ?? ["CV_BUILDER", "SAVED_JOBS", "LATEST_JOBS", "RECOMMENDED_JOBS"]) as string[],
  };
};

const mapJobRecord = (job: Record<string, any>) => ({
  jobId: job.jobId ?? job.job_profile_id ?? "",
  title: job.title ?? job.job_title ?? "",
  company: job.company ?? job.company_name ?? "",
  location: job.location ?? "",
  workType: job.workType ?? job.work_type ?? "",
  employmentType: job.employmentType ?? job.employment_type ?? "",
  salaryRange: job.salaryRange ?? `${job.salary_min ?? ""}-${job.salary_max ?? ""}`,
  matchScore: job.matchScore ?? job.match_score ?? 0,
  skills: job.skills ?? job.skills_required ?? [],
  requirements: job.requirements ?? job.requirements_list ?? [],
  responsibilities: job.responsibilities ?? job.responsibilities_list ?? [],
  postedDate: job.postedDate ?? job.published_at ?? "",
  description: job.description ?? job.job_description ?? job.job_description_snippet ?? "",
  savedAt: job.savedAt ?? job.saved_at,
});

const mapSavedJobsResponse = (payload: unknown): SavedJobsData => {
  const data = responseData(payload as Record<string, unknown>) as Record<string, any>;
  const jobs = data.jobs ?? data.saved_jobs ?? [];
  return {
    candidateId: data.candidateId ?? data.candidate_id ?? "",
    jobs: jobs.map(mapJobRecord),
    total: data.total ?? data.pagination?.total_items ?? jobs.length,
  };
};

const mapRecommendedResponse = (payload: unknown): RecommendedJobsData => {
  const data = responseData(payload as Record<string, unknown>) as Record<string, any>;
  const jobs = data.jobs ?? data.recommended_positions ?? [];
  return {
    candidateId: data.candidateId ?? data.candidate_id ?? "",
    jobs: jobs.map(mapJobRecord),
    total: data.total ?? data.pagination?.total_items ?? jobs.length,
  };
};

// The CV builder accepts a partial update: only the sections present in the body
// are overwritten, so undefined sections are stripped before sending.
const toCvPayload = (payload: SaveBuildMyCvRequest) => {
  const body: Record<string, unknown> = {
    personalDetails: payload.personalDetails,
    careerHistory: payload.careerHistory?.map((item) => ({
      company: item.company,
      jobTitle: item.jobTitle,
      startDate: item.startDate,
      endDate: item.endDate || null,
      responsibilities: item.responsibilities ?? "",
    })),
    skills: payload.skills,
    education: payload.education
      ? {
          secondaryEducation: payload.education.secondaryEducation,
          tertiaryEducation: payload.education.tertiaryEducation,
        }
      : undefined,
    languages: payload.languages,
  };

  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined),
  );
};

const mapBuildResponse = (payload: unknown): any => {
  const data = responseData(payload as Record<string, unknown>) as Record<string, any>;
  const personal = data.personalDetails ?? data.personal_details ?? {};
  const education = data.education ?? {};
  const careerHistory = data.careerHistory ?? data.career_history ?? data.experience ?? [];
  return {
    resumeId: data.resumeId ?? data.resume_id ?? "",
    currentStep: data.currentStep ?? "",
    completedSteps: data.completedSteps ?? [],
    steps: data.steps ?? [],
    personalDetails: {
      email: personal.email ?? "",
      firstName: personal.firstName ?? personal.first_name,
      lastName: personal.lastName ?? personal.last_name,
      race: personal.race,
      gender: personal.gender,
      disabilityStatus: personal.disabilityStatus ?? personal.disability_status,
      nationality: personal.nationality,
      location: personal.location ?? personal.residential_location,
      currentCompany: personal.currentCompany ?? personal.current_company,
      currentPosition: personal.currentPosition ?? personal.current_position,
      noticePeriod: personal.noticePeriod ?? personal.notice_period,
    },
    careerHistory: careerHistory.map((item: Record<string, any>) => ({
      company: item.company ?? item.company_name ?? item.employer_name ?? "",
      jobTitle: item.jobTitle ?? item.position_held ?? item.role_title ?? "",
      startDate: item.startDate ?? item.start_date ?? "",
      endDate: item.endDate ?? item.end_date ?? (item.is_current ? "Present" : ""),
      responsibilities: item.responsibilities ?? item.responsibilities_text,
    })),
    skills: data.skills ?? [],
    education: {
      secondaryEducation: education.secondary ? [education.secondary] : education.secondaryEducation ?? [],
      tertiaryEducation: education.tertiary ?? education.tertiaryEducation ?? [],
    },
    languages: (data.languages ?? []).map((item: any) => typeof item === "string" ? { language: item, proficiency: "" } : item),
    validation: data.validation ?? [],
    summary: data.summary ?? "",
    extractionStatus: data.extractionStatus ?? data.extraction_status ?? "NOT_STARTED",
    createdAt: data.createdAt ?? data.created_at ?? null,
    lastModified: data.lastModified ?? data.last_modified ?? data.updatedAt ?? data.updated_at ?? null,
    desiredJob: data.desiredJob ?? data.desired_job ?? {
      jobTitle: "",
      industry: "",
      workType: "",
      employmentType: "",
      salaryExpectation: 0,
      availableFrom: "",
    },
  };
};

const mapProfileResponse = (
  payload: CandidateProfileResponse | Record<string, any>,
): CandidateProfile => {
  const data = responseData(payload as Record<string, any>) as Record<string, any>;
  const personal = data.personalDetails ?? data.personal_details ?? {};
  const desiredJob = (data.desiredJob ?? data.desired_job ?? {}) as Record<string, any>;

  return {
    candidateId: data.candidateId ?? data.candidate_id,
    userId: data.userId ?? data.user_id ?? personal.userId,
    accountStatus: data.accountStatus ?? data.profile_status,
    profileCompleted: data.profileCompleted,
    personalDetails: {
      firstName: personal.firstName ?? personal.first_name ?? personal.full_name?.split(" ")[0] ?? "",
      lastName: personal.lastName ?? personal.last_name ?? personal.full_name?.split(" ").slice(1).join(" ") ?? "",
      email: personal.email ?? "",
      mobileNumber: personal.mobileNumber ?? personal.phone_number,
      race: personal.race,
      gender: personal.gender,
      disabilityStatus: personal.disabilityStatus ?? personal.disability_status,
      location: personal.location ?? personal.residential_location,
      currentCompany: personal.currentCompany ?? personal.current_company,
      currentPosition: personal.currentPosition ?? personal.current_position,
      noticePeriod: personal.noticePeriod ?? personal.notice_period,
      nationality: personal.nationality,
      idNumber: personal.idNumber,
      eeStatus: personal.eeStatus,
      profileImageUrl: personal.profileImageUrl,
      thumbnailUrl: personal.thumbnailUrl,
      linkedinUrl: personal.linkedinUrl,
      portfolioUrl: personal.portfolioUrl,
    },
    desiredJob: {
      jobTitle: desiredJob.jobTitle ?? desiredJob.role_title ?? "",
      industry: desiredJob.industry ?? desiredJob.targeted_industry ?? desiredJob.industries?.join(", ") ?? "",
      workType: desiredJob.workType ?? desiredJob.work_type ?? desiredJob.locations?.join(", ") ?? "",
      employmentType: desiredJob.employmentType ?? desiredJob.employment_type ?? desiredJob.jobType ?? "",
      salaryExpectation: desiredJob.salaryExpectation,
      currency: desiredJob.currency,
      industries: desiredJob.industries,
      locations: desiredJob.locations,
      jobType: desiredJob.jobType,
      availableFrom: desiredJob.availableFrom ?? desiredJob.availability_code,
    },
    education: data.education
      ? {
          certifications: ((data.education.tertiary ?? []) as Array<Record<string, any>>).map((item) => item.qualification).filter(Boolean),
          highestEarned: data.education.secondary?.qualification ?? data.education.secondary?.highest_grade_passed ?? "",
          tertiary: data.education.tertiary,
          secondary: data.education.secondary,
        }
      : null,
    experience: (data.experience ?? data.career_history ?? []).map((item: Record<string, any>) => ({
      company: item.company ?? item.company_name ?? item.employer_name ?? "",
      jobTitle: item.jobTitle ?? item.position_held ?? item.role_title ?? "",
      startDate: item.startDate ?? item.start_date ?? "",
      endDate: item.endDate ?? item.end_date ?? (item.is_current ? "Present" : ""),
      responsibilities: item.responsibilities ?? item.responsibilities_text,
    })),
    skills: data.skills ?? [],
    languages: Array.isArray(data.languages) ? data.languages.map((language: any) => typeof language === "string" ? { language, proficiency: "" } : language) : [],
    authentication: data.authentication ?? null,
    applications: data.applications ?? [],
    savedJobs: Array.isArray(data.savedJobs)
      ? data.savedJobs.map((job: any) =>
          typeof job === "string" ? job : job.jobId,
        )
      : [],
    resume: data.resume ?? null,
  };
};

export const candidateApi = {
  async getById(candidateId: string, userId?: string): Promise<CandidateProfile> {
    const payload = await unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.profile, { candidateId })),
    );
    const profile = mapProfileResponse(payload as Record<string, any>);
    // Prefer the caller's userId, but keep the one the response carries.
    return { ...profile, userId: userId ?? profile.userId ?? "" };
  },

  async updateById(
    candidateId: string,
    payload: CandidateProfileUpdatePayload,
  ): Promise<CandidateProfile> {
    await apiClient.put(
      resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId }),
      toCvPayload({
        personalDetails: payload.personalDetails as SaveBuildMyCvRequest["personalDetails"],
        careerHistory: payload.experience,
        skills: payload.skills,
        languages: payload.languages,
      }),
    );
    return this.getById(candidateId);
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

  getDashboard(query: CandidateDashboardQuery = {}): Promise<CandidateDashboardData> {
    return unwrapResponseData(
      apiClient.get(apiEndpoints.candidate.dashboard, { params: query }),
    ).then(mapDashboardResponse);
  },

  getLanding(): Promise<CandidateLandingData> {
    return unwrapResponseData(apiClient.get(apiEndpoints.candidate.landing)).then((payload) => {
      const data = responseData(payload as Record<string, unknown>) as Record<string, any>;
      return {
        stats: {
          totalJobs: data.stats?.totalJobs ?? data.stats?.total_jobs ?? 0,
          totalCandidates: data.stats?.totalCandidates ?? data.stats?.total_candidates ?? 0,
          totalPlacements: data.stats?.totalPlacements ?? data.stats?.total_placements ?? 0,
        },
        featuredJobs: data.featuredJobs ?? data.featured_jobs ?? [],
      };
    });
  },

  getSavedJobs(candidateId: string): Promise<SavedJobsData> {
    return unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.savedJobs, { candidateId })),
    ).then(mapSavedJobsResponse);
  },

  saveJob(payload: SaveJobRequest): Promise<unknown> {
    // The collection endpoint takes the job in the body; candidate-scoped
    // deployments that put it in the path still resolve via the template.
    return unwrapResponseData(
      apiClient.post(
        resolveEndpoint(apiEndpoints.candidate.savedJobs, {
          candidateId: payload.candidateId,
        }),
        { jobId: payload.jobProfileId },
      ),
    );
  },

  removeSavedJob(candidateId: string, jobProfileId: string): Promise<unknown> {
    return unwrapResponseData(
      apiClient.delete(resolveEndpoint(apiEndpoints.candidate.savedJob, { candidateId, jobProfileId })),
    );
  },

  getRecommendedPositions(candidateId: string): Promise<RecommendedJobsData> {
    return unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.recommendedJobs, { candidateId })),
    ).then(mapRecommendedResponse);
  },

  getAiActions(candidateId: string): Promise<AiActionsData> {
    return unwrapResponseData(apiClient.get(resolveEndpoint(apiEndpoints.candidate.aiActions, { candidateId }))).then((payload) => {
      const data = responseData(payload as Record<string, unknown>) as Record<string, any>;
      return {
        candidateId: data.candidateId ?? data.candidate_id ?? candidateId,
        actions: (data.actions ?? []).map((action: string | Record<string, any>, index: number) => typeof action === "string" ? { actionId: `ai-${index}`, type: "CAREER_NUDGE" as const, label: action } : action),
      };
    });
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

  getRecommendedJobs(): Promise<SuccessEnvelope<RecommendedJobsData>> {
    return unwrapResponseData(
      apiClient.get(apiEndpoints.candidate.recommendedJobs),
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

  getBuildMyCv(candidateId: string): Promise<BuildMyCvState> {
    return unwrapResponseData(
      apiClient.get(resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId })),
    ).then((payload) => mapBuildResponse(payload) as BuildMyCvState);
  },

  saveBuildMyCv(candidateId: string, payload: SaveBuildMyCvRequest): Promise<BuildMyCvData> {
    return unwrapResponseData(
      apiClient.post<SuccessEnvelope<BuildMyCvData>>(
        resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId }),
        toCvPayload(payload),
      ),
    ).then((payload) => mapBuildResponse(payload) as BuildMyCvData);
  },

  updateBuildMyCv(candidateId: string, payload: UpdateBuildMyCvRequest): Promise<BuildMyCvData> {
    return unwrapResponseData(
      apiClient.put<SuccessEnvelope<BuildMyCvData>>(
        resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId }),
        toCvPayload(payload),
      ),
    ).then((payload) => mapBuildResponse(payload) as BuildMyCvData);
  },

  createSimpleProfile(candidateId: string, payload: SimpleCandidateProfileInput): Promise<SimpleCandidateProfileResponse> {
    return unwrapResponseData(
      apiClient.post(
        resolveEndpoint(apiEndpoints.candidate.profile, { candidateId }),
        {
          personal_details: {
            full_name: payload.personalDetails.fullName,
            email: payload.personalDetails.email,
            phone_number: payload.personalDetails.phoneNumber,
            residential_location: payload.personalDetails.residentialLocation,
          },
          job_details: {
            preferred_job_title: payload.jobDetails.preferredJobTitle,
            targeted_industries: payload.jobDetails.targetedIndustries,
            preferred_location: payload.jobDetails.preferredLocation,
            employment_type: payload.jobDetails.employmentType,
            availability: payload.jobDetails.availability,
          },
          experience: payload.experience
            ? {
                current_job_title: payload.experience.currentJobTitle,
                current_employer: payload.experience.currentEmployer,
                total_years_experience: payload.experience.totalYearsExperience,
              }
            : undefined,
        },
      ),
    ).then((raw) => {
      const data = responseData(raw as Record<string, unknown>) as Record<string, any>;
      return {
        candidateId: data.candidate_id ?? data.candidateId ?? candidateId,
        profileStatus: data.profile_status ?? data.profileStatus ?? "ACTIVE",
        message: data.message ?? "",
        createdAt: data.created_at ?? data.createdAt ?? null,
        updatedAt: data.updated_at ?? data.updatedAt ?? null,
      };
    });
  },
};
