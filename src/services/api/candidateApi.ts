import {
  apiClient,
  candidateApiClient,
  documentApiClient,
  unwrapEnvelopeData,
  unwrapResponseData,
} from "@/services/api/axios";
import type { AxiosResponse } from "axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import {
  toAvailabilityEnum,
  toAvailabilityLabel,
  toEmploymentTypeEnum,
  toEmploymentTypeLabel,
  toPreferredLocationEnum,
  toPreferredLocationLabel,
} from "@/modules/candidate/utils/profileEnums";
import { aiApi } from "@/services/api/aiApi";
import type {
  BuildMyCvData,
  BuildMyCvEducationSection,
  BuildMyCvPersonalDetails,
  BuildMyCvState,
  AiActionsData,
  ApplyJobRequest,
  ApplyJobResponse,
  CandidateLandingData,
  CandidateStatisticsData,
  CandidateApplication,
  CandidateAuthentication,
  CandidateExperience,
  CandidateLanguage,
  CandidateDashboardData,
  CandidateDashboardQuery,
  CandidateProfile,
  CvDownloadData,
  CvPreviewData,
  CvUploadData,
  GenerateSkillsRequest,
  RecommendedJobsData,
  SavedJobsData,
  SaveJobRequest,
  SaveBuildMyCvRequest,
  SimpleCandidateProfileInput,
  SimpleCandidateProfileResponse,
  UpdateBuildMyCvRequest,
  ResumeDocumentUploadResult,
  ResumeRef,
  PersonalDetails,
  DesiredJob,
  SuccessEnvelope,
  UserProfile,
  UserSkill,
} from "@/types/api";
import type { CandidateProfileUpdatePayload } from "@/modules/candidate/types";
import { toSouthAfricaApiPhoneNumber } from "@/app/phoneNumber";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import { resolveIndustryId, resolveIndustryName } from "@/services/api/industryApi";

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

// Drops keys with no meaningful value (undefined, null, or empty string) so
// optional/untouched fields aren't sent to the API at all.
const omitUndefined = <T extends object>(input: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as Partial<T>;

type RawDashboardPipelineStage =
  | string
  | {
      stage_code?: string;
      display_name?: string;
      from_stage_code?: string;
      to_stage_code?: string;
      stage_history_id?: string;
    };

type RawDashboardApplication = {
  id?: string;
  application_id?: string;
  job?: {
    id?: string;
    title?: string;
    company?: string;
  };
  job_id?: string;
  job_profile_id?: string;
  job_profile_id_ref?: string;
  job_title?: string;
  company_name?: string;
  stage?: string;
  current_stage?: string;
  current_stage_code?: string;
  statusMessage?: string;
  message?: string;
  stage_progress?: RawDashboardPipelineStage[];
  pipeline?: RawDashboardPipelineStage[];
  application_status?: string;
};

type RawCandidateDashboardResponse = {
  id?: string;
  candidateId?: string;
  candidate_id?: string;
  summary?: Partial<CandidateDashboardData["summary"]>;
  activity?: CandidateDashboardData["activity"];
  applications?: RawDashboardApplication[];
  quickLinks?: string[];
};

type RawCandidateDashboardEnvelope = {
  success?: boolean;
  status?: string;
  statusCode?: number;
  message?: string;
  data?: RawCandidateDashboardResponse;
};

const mapDashboardResponse = (
  payload: RawCandidateDashboardResponse | RawCandidateDashboardEnvelope,
): CandidateDashboardData => {
  const data = responseData<RawCandidateDashboardResponse>(payload);
  const applications = Array.isArray(data.applications)
    ? data.applications
    : [];
  const normalizedApplications = applications.map((item) => {
    const progress = Array.isArray(item.stage_progress)
      ? item.stage_progress
      : item.pipeline;
    return {
      id: item.id ?? item.application_id ?? "",
      job: {
        id:
          item.job?.id ??
          item.job_id ??
          item.job_profile_id ??
          item.job_profile_id_ref ??
          "",
        title: item.job?.title ?? item.job_title ?? "",
        company: item.job?.company ?? item.company_name ?? "",
      },
      stage: item.stage ?? item.current_stage ?? item.current_stage_code ?? "",
      statusMessage: item.statusMessage ?? item.message ?? "",
      pipeline: Array.isArray(progress)
        ? progress.map((stage) =>
            typeof stage === "string"
              ? stage
              : (stage.stage_code ??
                stage.display_name ??
                stage.to_stage_code ??
                stage.from_stage_code ??
                ""),
          )
        : [],
    };
  });
  const summary = data.summary ?? {};
  const statuses = applications.map((item) =>
    String(item.application_status ?? ""),
  );

  return {
    id: String(data.id ?? data.candidate_id ?? ""),
    candidateId: data.candidateId ?? data.candidate_id,
    summary: {
      totalApplications:
        summary.totalApplications ?? normalizedApplications.length,
      submitted:
        summary.submitted ??
        statuses.filter((status) => status === "SUBMITTED").length,
      inProgress:
        summary.inProgress ??
        statuses.filter((status) =>
          ["ACTIVE", "SUBMITTED", "ON_HOLD"].includes(status),
        ).length,
      successful: summary.successful ?? 0,
    },
    activity: (data.activity ?? {
      jobsAppliedThisWeek: 0,
      recruiterProfileViewsThisWeek: 0,
      coursesCompletedThisWeek: 0,
    }) as CandidateDashboardData["activity"],
    applications: normalizedApplications,
    quickLinks: (data.quickLinks ?? [
      "CV_BUILDER",
      "SAVED_JOBS",
      "LATEST_JOBS",
      "RECOMMENDED_JOBS",
    ]) as string[],
  };
};

type RawCandidateJobRecord = {
  jobId?: string;
  jobProfileId?: string;
  job_profile_id?: string;
  title?: string;
  job_title?: string;
  company?: string;
  company_name?: string;
  location?: string;
  location_text?: string;
  industry?: string;
  workType?: string;
  work_type?: string;
  employmentType?: string;
  employment_type?: string;
  salaryRange?: string;
  salary_min?: string | number;
  salary_max?: string | number;
  matchScore?: number;
  match_score?: number;
  skills?: string[];
  skills_required?: string[];
  requirements?: string[];
  requirements_list?: string[];
  responsibilities?: string[];
  responsibilities_list?: string[];
  postedDate?: string;
  published_at?: string;
  description?: string;
  job_description?: string;
  job_description_snippet?: string;
  savedAt?: string;
  saved_at?: string;
};

type RawCandidateJobCollection = {
  candidateId?: string;
  candidate_id?: string;
  jobs?: RawCandidateJobRecord[];
  saved_jobs?: RawCandidateJobRecord[];
  recommended_positions?: RawCandidateJobRecord[];
  total?: number;
  pagination?: { total_items?: number };
};

type RawCandidateJobCollectionEnvelope = {
  success?: boolean;
  status?: string;
  statusCode?: number;
  message?: string;
  data?: RawCandidateJobCollection;
};

const mapJobRecord = (job: RawCandidateJobRecord) => ({
  jobId: job.jobId ?? job.job_profile_id ?? "",
  jobProfileId: job.jobProfileId ?? job.job_profile_id ?? "",
  title: job.title ?? job.job_title ?? "",
  company: job.company ?? job.company_name ?? "",
  location: job.location ?? job.location_text ?? "",
  workType: formatEnumLabel(job.workType ?? job.work_type),
  employmentType: formatEnumLabel(job.employmentType ?? job.employment_type),
  salaryRange:
    job.salaryRange ?? `${job.salary_min ?? ""}-${job.salary_max ?? ""}`,
  matchScore: job.matchScore ?? job.match_score ?? 0,
  skills: job.skills ?? job.skills_required ?? [],
  requirements: job.requirements ?? job.requirements_list ?? [],
  responsibilities: job.responsibilities ?? job.responsibilities_list ?? [],
  postedDate: job.postedDate ?? job.published_at ?? "",
  description:
    job.description ?? job.job_description ?? job.job_description_snippet ?? "",
  savedAt: job.savedAt ?? job.saved_at,
});

type CandidateJobCollectionData = SavedJobsData | RecommendedJobsData;

const mapCandidateJobCollectionResponse = <
  TCollection extends CandidateJobCollectionData,
>(
  payload: RawCandidateJobCollection | RawCandidateJobCollectionEnvelope,
  jobsField: "saved_jobs" | "recommended_positions",
): TCollection => {
  const data = responseData<RawCandidateJobCollection>(payload);
  const jobs = data.jobs ?? data[jobsField] ?? [];

  return {
    candidateId: data.candidateId ?? data.candidate_id ?? "",
    jobs: jobs.map(mapJobRecord),
    total: data.total ?? data.pagination?.total_items ?? jobs.length,
  } as unknown as TCollection;
};

const mapSavedJobsResponse = (
  payload: RawCandidateJobCollection | RawCandidateJobCollectionEnvelope,
): SavedJobsData =>
  mapCandidateJobCollectionResponse<SavedJobsData>(payload, "saved_jobs");

const mapRecommendedResponse = (
  payload: RawCandidateJobCollection | RawCandidateJobCollectionEnvelope,
): RecommendedJobsData =>
  mapCandidateJobCollectionResponse<RecommendedJobsData>(
    payload,
    "recommended_positions",
  );

// The API expects full YYYY-MM-DD dates; month-year form values default to the 1st.
const toFullDate = (value?: string | null): string | null => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;

  const match = value.trim().match(/^([A-Za-z]+),\s?(\d{4})$/);
  if (!match) return value;

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const monthIndex = monthNames.findIndex((month) =>
    month.startsWith(match[1].toLowerCase()),
  );
  return monthIndex < 0
    ? value
    : `${match[2]}-${String(monthIndex + 1).padStart(2, "0")}-01`;
};

// The CV builder accepts a partial update: only the sections present in the body
// are overwritten, so undefined sections are stripped before sending.
const toCvPayload = (payload: SaveBuildMyCvRequest) => {
  const personalDetails = payload.personalDetails
    ? {
        ...payload.personalDetails,
        ...(payload.personalDetails.mobileNumber
          ? {
              mobileNumber: toSouthAfricaApiPhoneNumber(
                payload.personalDetails.mobileNumber,
              ),
            }
          : {}),
      }
    : undefined;

  const careerHistory = payload.careerHistory?.map((item) => {
    const isCurrent = !item.endDate || item.endDate === "Present";
    return {
      company_name: item.company,
      position_held: item.jobTitle,
      start_date: toFullDate(item.startDate),
      end_date: isCurrent ? null : toFullDate(item.endDate),
      is_current: isCurrent,
      responsibilities: (item.responsibilities ?? "")
        .split(";")
        .map((task) => task.trim())
        .filter(Boolean),
    };
  });

  const body: Record<string, unknown> = {
    personal_details: personalDetails
      ? {
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
          phone_number: personalDetails.mobileNumber,
          residential_location: personalDetails.location,
          nationality: personalDetails.nationality,
          race: personalDetails.race,
          gender: personalDetails.gender,
          disability_status: personalDetails.disabilityStatus,
          ...(personalDetails.currentCompany?.trim()
            ? { current_company: personalDetails.currentCompany.trim() }
            : {}),
          ...(personalDetails.currentPosition?.trim()
            ? { current_position: personalDetails.currentPosition.trim() }
            : {}),
          ...(personalDetails.noticePeriod?.trim()
            ? { notice_period: personalDetails.noticePeriod.trim() }
            : {}),
        }
      : undefined,
    // career_history entries require an array of responsibilities and an explicit
    // is_current flag — "Present" (set by the form when isCurrentRole is checked)
    // maps to is_current: true with no end date.
    ...(careerHistory?.length ? { career_history: careerHistory } : {}),
    // Skills are { skill_name } objects, not plain strings.
    skills: payload.skills?.map((skillName) => ({ skill_name: skillName })),
    // Education is a single flat array; level_code distinguishes tertiary from secondary.
    education: payload.education
      ? [
          ...payload.education.tertiaryEducation.map((entry) => ({
            institution_name: entry.institution,
            qualification: entry.qualification,
            level_code: "TERTIARY",
            year_completed: entry.yearCompleted,
          })),
          ...payload.education.secondaryEducation.map((entry) => ({
            institution_name: entry.schoolName,
            qualification: entry.qualification,
            level_code: "SECONDARY",
            year_completed: entry.yearCompleted,
          })),
        ]
      : undefined,
    // Languages are plain names; the schema has no proficiency concept.
    languages: payload.languages?.map((entry) => entry.language),
  };

  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined),
  );
};

type RawBuildMyCvPersonalDetails = Partial<BuildMyCvPersonalDetails> & {
  first_name?: string;
  last_name?: string;
  disability_status?: string;
  residential_location?: string;
  current_company?: string;
  current_position?: string;
  notice_period?: string;
};

type RawBuildMyCvCareerHistoryEntry = Partial<CandidateExperience> & {
  company_name?: string;
  employer_name?: string;
  position_held?: string;
  role_title?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  responsibilities_text?: string | string[];
};

type CandidateDocument = {
  documentId: string;
  documentType?: string;
  lifecycleStatus?: string;
  viewUrl?: string;
  downloadUrl?: string;
};

const resolveDocumentUrl = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return undefined;

  const candidate = value as Record<string, unknown>;
  for (const key of ["url", "href", "presigned_url", "signed_url", "view_url", "download_url"]) {
    const resolved = resolveDocumentUrl(candidate[key]);
    if (resolved) return resolved;
  }
  return undefined;
};

const mapDocument = (item: Record<string, any>): CandidateDocument => ({
  documentId: item.document_id ?? item.documentId ?? "",
  documentType:
    item.document_type ?? item.documentType ?? item.type ?? item.document_type_code,
  lifecycleStatus: item.lifecycle_status ?? item.lifecycleStatus ?? item.status,
  viewUrl: resolveDocumentUrl(
    item.view_url ??
      item.viewUrl ??
      item.document_view_url ??
      item.url ??
      item.view ??
      item.cloud_details?.view_url ??
      item.document_cloud_details?.view_url ??
      item.documentCloudDetails?.viewUrl ??
      item.presigned_urls?.find((entry: Record<string, any>) =>
        String(entry.operation ?? entry.type ?? "").toUpperCase().includes("VIEW"),
      ),
  ),
  downloadUrl: resolveDocumentUrl(
    item.download_url ??
      item.downloadUrl ??
      item.document_download_url ??
      item.download ??
      item.cloud_details?.download_url ??
      item.document_cloud_details?.download_url ??
      item.documentCloudDetails?.downloadUrl ??
      item.presigned_urls?.find((entry: Record<string, any>) =>
        String(entry.operation ?? entry.type ?? "").toUpperCase().includes("DOWNLOAD"),
      ),
  ),
});

type RawBuildMyCvEducationEntry = {
  level_code?: string;
  institution?: string;
  institution_name?: string;
  schoolName?: string;
  school_name?: string;
  qualification?: string;
  yearCompleted?: number | string | null;
  year_completed?: number | string | null;
};

type RawBuildMyCvEducation =
  | RawBuildMyCvEducationEntry[]
  | {
      secondary?: RawBuildMyCvEducationEntry;
      tertiary?: RawBuildMyCvEducationEntry[];
      secondaryEducation?: RawBuildMyCvEducationEntry[];
      tertiaryEducation?: RawBuildMyCvEducationEntry[];
    };

type RawBuildMyCvSkill =
  | string
  | {
      name?: unknown;
      skillName?: unknown;
      skill_name?: unknown;
    };

type RawBuildMyCvResponse = {
  candidateId?: string;
  candidate_id?: string;
  resumeId?: string;
  resume_id?: string;
  currentStep?: string;
  completedSteps?: string[];
  steps?: string[];
  personalDetails?: RawBuildMyCvPersonalDetails;
  personal_details?: RawBuildMyCvPersonalDetails;
  careerHistory?: RawBuildMyCvCareerHistoryEntry[];
  career_history?: RawBuildMyCvCareerHistoryEntry[];
  experience?: RawBuildMyCvCareerHistoryEntry[];
  skills?: RawBuildMyCvSkill[];
  education?: RawBuildMyCvEducation;
  languages?: Array<string | CandidateLanguage>;
  validation?: string[];
  summary?: string;
  extractionStatus?: string;
  extraction_status?: string;
  createdAt?: string | null;
  created_at?: string | null;
  lastModified?: string | null;
  last_modified?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
  desiredJob?: DesiredJob;
  desired_job?: DesiredJob;
};

type RawBuildMyCvEnvelope = {
  success?: boolean;
  status?: string;
  statusCode?: number;
  message?: string;
  data?: RawBuildMyCvResponse;
};

const mapBuildResponse = (
  payload: RawBuildMyCvResponse | RawBuildMyCvEnvelope,
): BuildMyCvData => {
  const data = responseData<RawBuildMyCvResponse>(payload);
  const personal = data.personalDetails ?? data.personal_details ?? {};
  const education = data.education ?? {};
  const educationEntries = Array.isArray(education) ? education : [];
  const careerHistory =
    data.careerHistory ?? data.career_history ?? data.experience ?? [];
  const normalizeResponsibilities = (value: unknown): string | undefined => {
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === "string")
        .join("; ");
    }
    return typeof value === "string" ? value : undefined;
  };
  const normalizeEducationEntry = (entry: RawBuildMyCvEducationEntry) => ({
    institution:
      entry.institution ??
      entry.institution_name ??
      entry.schoolName ??
      entry.school_name ??
      "",
    qualification: entry.qualification ?? "",
    yearCompleted: entry.yearCompleted ?? entry.year_completed ?? null,
  });
  const secondaryEducation = Array.isArray(education)
    ? educationEntries.filter((item) => item.level_code === "SECONDARY")
    : education.secondary
      ? [education.secondary]
      : (education.secondaryEducation ?? []);
  const tertiaryEducation = Array.isArray(education)
    ? educationEntries.filter((item) => item.level_code !== "SECONDARY")
    : (education.tertiary ?? education.tertiaryEducation ?? []);
  return {
    candidateId: data.candidateId ?? data.candidate_id,
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
    careerHistory: careerHistory.map((item) => ({
      company: item.company ?? item.company_name ?? item.employer_name ?? "",
      jobTitle: item.jobTitle ?? item.position_held ?? item.role_title ?? "",
      startDate: item.startDate ?? item.start_date ?? "",
      endDate:
        item.endDate ?? item.end_date ?? (item.is_current ? "Present" : ""),
      responsibilities:
        normalizeResponsibilities(item.responsibilities) ??
        normalizeResponsibilities(item.responsibilities_text),
    })),
    skills: (data.skills ?? [])
      .map((skill) => {
        if (typeof skill === "string") return skill;
        return skill.skillName ?? skill.skill_name ?? skill.name;
      })
      .filter((skill): skill is string => typeof skill === "string"),
    education: {
      secondaryEducation: secondaryEducation.map(normalizeEducationEntry),
      tertiaryEducation: tertiaryEducation.map(normalizeEducationEntry),
    } as unknown as BuildMyCvEducationSection,
    languages: (data.languages ?? []).map((item) =>
      typeof item === "string" ? { language: item, proficiency: "" } : item,
    ),
    validation: data.validation ?? [],
    summary: data.summary ?? "",
    extractionStatus:
      data.extractionStatus ?? data.extraction_status ?? "NOT_STARTED",
    createdAt: data.createdAt ?? data.created_at ?? null,
    lastModified:
      data.lastModified ??
      data.last_modified ??
      data.updatedAt ??
      data.updated_at ??
      null,
    desiredJob: data.desiredJob ??
      data.desired_job ?? {
        jobTitle: "",
        industry: "",
        workType: "",
        employmentType: "",
        salaryExpectation: 0,
        availableFrom: "",
      },
  };
};

const mapBuildMyCvRequest = async (
  request: Promise<AxiosResponse<RawBuildMyCvResponse | RawBuildMyCvEnvelope>>,
): Promise<BuildMyCvData> => {
  const response = await unwrapResponseData(request);
  return mapBuildResponse(response);
};

type RawProfilePersonalDetails = Partial<PersonalDetails> & {
  userId?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  alternate_email?: string;
  phone_number?: string;
  alternate_email_address?: string;
  alternate_phone_number?: string;
  disability_status?: string;
  residential_location?: string;
  current_company?: string;
  current_position?: string;
  notice_period?: string;
};

type RawProfileDesiredJob = Partial<DesiredJob> & {
  role_title?: string;
  role_title_id?: string;
  targeted_industry_id?: string;
  targeted_industry?: string;
  work_type?: string;
  employment_type?: string;
  availability_code?: string;
};

type RawProfileEducationEntry = {
  qualification?: string;
  highest_grade_passed?: string;
  [key: string]: unknown;
};

type RawProfileEducation = {
  tertiary?: RawProfileEducationEntry[];
  secondary?: RawProfileEducationEntry | null;
  tertiaryEducation?: RawProfileEducationEntry[];
  secondaryEducation?: RawProfileEducationEntry[];
};

type RawProfileExperience = Partial<CandidateExperience> & {
  company_name?: string;
  employer_name?: string;
  position_held?: string;
  role_title?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  responsibilities_text?: string;
};

type RawSavedJobReference = string | { jobId?: string; jobProfileId?: string };

type RawCandidateProfileResponse = {
  candidateId?: string;
  candidate_id?: string;
  userId?: string;
  user_id?: string;
  accountStatus?: string;
  profile_status?: string;
  profileCompleted?: number;
  personalDetails?: RawProfilePersonalDetails;
  personal_details?: RawProfilePersonalDetails;
  desiredJob?: RawProfileDesiredJob;
  desired_job?: RawProfileDesiredJob | null;
  education?: RawProfileEducation | null;
  experience?: RawProfileExperience[];
  career_history?: RawProfileExperience[];
  skills?: string[];
  languages?: CandidateLanguage[];
  authentication?: CandidateAuthentication | null;
  applications?: CandidateApplication[];
  savedJobs?: RawSavedJobReference[];
  resume?: ResumeRef | null;
};

type RawCandidateProfileEnvelope = {
  success?: boolean;
  status?: string;
  statusCode?: number;
  message?: string;
  data?: RawCandidateProfileResponse;
};

const mapProfileResponse = (
  payload: RawCandidateProfileResponse | RawCandidateProfileEnvelope,
): CandidateProfile => {
  const data = responseData<RawCandidateProfileResponse>(payload);
  const personal = data.personalDetails ?? data.personal_details ?? {};
  const desiredJob = data.desiredJob ?? data.desired_job ?? {};

  return {
    candidateId: data.candidateId ?? data.candidate_id,
    userId: data.userId ?? data.user_id ?? personal.userId ?? "",
    accountStatus: data.accountStatus ?? data.profile_status,
    profileCompleted: data.profileCompleted,
    personalDetails: {
      firstName:
        personal.firstName ??
        personal.first_name ??
        personal.full_name?.split(" ")[0] ??
        "",
      lastName:
        personal.lastName ??
        personal.last_name ??
        personal.full_name?.split(" ").slice(1).join(" ") ??
        "",
      email:
        personal.email ??
        personal.alternate_email ??
        personal.alternate_email_address ??
        "",
      mobileNumber: personal.mobileNumber ?? personal.phone_number,
      alternateEmail:
        personal.alternateEmail ?? personal.alternate_email_address,
      alternateMobileNumber:
        personal.alternateMobileNumber ?? personal.alternate_phone_number,
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
      industry:
        desiredJob.industry ??
        desiredJob.targeted_industry_id ??
        desiredJob.targeted_industry ??
        desiredJob.industries?.join(", ") ??
        "",
      workType:
        toPreferredLocationLabel(
          desiredJob.workType ?? desiredJob.work_type ?? desiredJob.locations?.join(", "),
        ),
      employmentType:
        toEmploymentTypeLabel(
          desiredJob.employmentType ?? desiredJob.employment_type ?? desiredJob.jobType,
        ),
      salaryExpectation: desiredJob.salaryExpectation ?? 0,
      currency: desiredJob.currency,
      industries: desiredJob.industries,
      locations: desiredJob.locations,
      jobType: desiredJob.jobType,
      availableFrom:
        toAvailabilityLabel(
          desiredJob.availableFrom ?? desiredJob.availability_code,
        ),
    },
    education: data.education
      ? {
          certifications: (data.education.tertiary ?? [])
            .map((item) => item.qualification)
            .filter((qualification): qualification is string =>
              Boolean(qualification),
            ),
          highestEarned:
            data.education.secondary?.qualification ??
            data.education.secondary?.highest_grade_passed ??
            "",
          tertiary: data.education.tertiary,
          secondary: data.education.secondary,
        }
      : null,
    experience: (data.experience ?? data.career_history ?? []).map((item) => ({
      company: item.company ?? item.company_name ?? item.employer_name ?? "",
      jobTitle: item.jobTitle ?? item.position_held ?? item.role_title ?? "",
      startDate: item.startDate ?? item.start_date ?? "",
      endDate:
        item.endDate ?? item.end_date ?? (item.is_current ? "Present" : ""),
      responsibilities: item.responsibilities ?? item.responsibilities_text,
    })),
    skills: data.skills ?? [],
    languages: Array.isArray(data.languages) ? data.languages : [],
    authentication: data.authentication ?? null,
    applications: data.applications ?? [],
    savedJobs: Array.isArray(data.savedJobs)
      ? data.savedJobs
          .map((job) =>
            typeof job === "string" ? job : (job.jobProfileId ?? job.jobId),
          )
          .filter((jobId): jobId is string => Boolean(jobId))
      : [],
    resume: data.resume ?? null,
  };
};

export const candidateApi = {
  async listOwnerDocuments(ownerId: string): Promise<CandidateDocument[]> {
    const payload = await unwrapResponseData(
      documentApiClient.get<Record<string, any> | Record<string, any>[]>(
        resolveEndpoint(apiEndpoints.documents.owner, {
          ownerType: "CANDIDATE",
          ownerId,
        }),
      ),
    );
    const data = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.data?.documents)
          ? payload.data.documents
        : Array.isArray(payload.documents)
          ? payload.documents
          : [];
    return data.map(mapDocument);
  },

  async getDocument(documentId: string): Promise<CandidateDocument> {
    const payload = await unwrapResponseData(
      documentApiClient.get<Record<string, any>>(
        resolveEndpoint(apiEndpoints.documents.detail, { documentId }),
      ),
    );
    const data = payload.data && typeof payload.data === "object"
      ? payload.data
      : payload;
    return mapDocument(data);
  },

  async getById(
    candidateId: string,
    userId?: string,
  ): Promise<CandidateProfile> {
    const payload = await unwrapResponseData(
      candidateApiClient.get<
        RawCandidateProfileResponse | RawCandidateProfileEnvelope
      >(resolveEndpoint(apiEndpoints.candidate.profile, { candidateId })),
    );
    const profile = mapProfileResponse(payload);
    if (/^[0-9a-f-]{36}$/i.test(profile.desiredJob.industry)) {
      try {
        profile.desiredJob.industry =
          (await resolveIndustryName(profile.desiredJob.industry)) ?? "";
      } catch {
        profile.desiredJob.industry = "";
      }
    }
    // Prefer the caller's userId, but keep the one the response carries.
    return { ...profile, userId: userId ?? profile.userId ?? "" };
  },

  async updateById(
    candidateId: string,
    payload: CandidateProfileUpdatePayload,
  ): Promise<CandidateProfile> {
    const personalDetails = payload.personalDetails ?? {};
    const targetedIndustriesId = await resolveIndustryId(
      payload.desiredJob?.industry,
    );
    await candidateApiClient.put(
      resolveEndpoint(apiEndpoints.candidate.profile, { candidateId }),
      {
        personal_details: omitUndefined({
          first_name: personalDetails.firstName,
          last_name: personalDetails.lastName,
          alternate_email: personalDetails.email,
          phone_number: personalDetails.mobileNumber,
          residential_location: personalDetails.location,
          alternate_email_address: personalDetails.alternateEmail,
          alternate_phone_number: personalDetails.alternateMobileNumber,
        }),
        job_details: omitUndefined({
          role_title: payload.desiredJob?.jobTitle,
          targeted_industry_id: targetedIndustriesId,
          preferred_location: toPreferredLocationEnum(payload.desiredJob?.workType),
          employment_type: toEmploymentTypeEnum(payload.desiredJob?.employmentType),
          availability: toAvailabilityEnum(payload.desiredJob?.availableFrom),
        }),
      },
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
      apiClient.delete(
        resolveEndpoint(apiEndpoints.users.profilePhoto, { userId }),
      ),
    );
  },

  getDashboard(
    query: CandidateDashboardQuery = {},
  ): Promise<CandidateDashboardData> {
    return unwrapResponseData(
      candidateApiClient.get(apiEndpoints.candidate.dashboard, {
        params: query,
      }),
    ).then(mapDashboardResponse);
  },

  getLanding(): Promise<CandidateLandingData> {
    return unwrapResponseData(
      candidateApiClient.get(apiEndpoints.candidate.landing),
    ).then((payload) => {
      const data = responseData(payload as Record<string, unknown>) as Record<
        string,
        any
      >;
      return {
        stats: {
          totalJobs: data.stats?.totalJobs ?? data.stats?.total_jobs ?? 0,
          totalCandidates:
            data.stats?.totalCandidates ?? data.stats?.total_candidates ?? 0,
          totalPlacements:
            data.stats?.totalPlacements ?? data.stats?.total_placements ?? 0,
        },
        featuredJobs: data.featuredJobs ?? data.featured_jobs ?? [],
      };
    });
  },

  getStatistics(): Promise<CandidateStatisticsData> {
    return unwrapResponseData(
      candidateApiClient.get(apiEndpoints.candidate.statistics),
    ).then((payload) => {
      const data = responseData(payload as Record<string, unknown>) as Record<
        string,
        any
      >;
      const stats = data.statistics ?? {};
      const profileSummary = data.profile_summary ?? data.profileSummary ?? {};
      return {
        candidateId: data.candidateId ?? data.candidate_id ?? null,
        statistics: {
          totalApplications:
            stats.totalApplications ?? stats.total_applications ?? 0,
          successfulApplications:
            stats.successfulApplications ?? stats.successful_applications ?? 0,
          inProgressApplications:
            stats.inProgressApplications ?? stats.in_progress_applications ?? 0,
          rejectedApplications:
            stats.rejectedApplications ?? stats.rejected_applications ?? 0,
        },
        profileSummary: {
          firstName:
            profileSummary.firstName ?? profileSummary.first_name ?? "",
          lastName: profileSummary.lastName ?? profileSummary.last_name ?? "",
          email: profileSummary.email ?? "",
          profileStatus:
            profileSummary.profileStatus ??
            profileSummary.profile_status ??
            "INCOMPLETE",
        },
        createdAt: data.createdAt ?? data.created_at ?? null,
      };
    });
  },

  getSavedJobs(candidateId: string): Promise<SavedJobsData> {
    return unwrapResponseData(
      candidateApiClient.get<
        RawCandidateJobCollection | RawCandidateJobCollectionEnvelope
      >(resolveEndpoint(apiEndpoints.candidate.savedJobs, { candidateId })),
    ).then(mapSavedJobsResponse);
  },

  async applyToJob(
    jobProfileId: string,
    payload: ApplyJobRequest = {},
  ): Promise<ApplyJobResponse> {
    const raw = await unwrapResponseData(
      candidateApiClient.post<Record<string, any>>(
        apiEndpoints.candidate.applications,
        omitUndefined({
          job_profile_id: jobProfileId,
          match_score_latest: payload.matchScoreLatest,
        }),
      ),
    );
    return {
      applicationId: raw.application_id,
      candidateId: raw.candidate_id,
      jobProfileId: raw.job_profile_id,
      applicationPartyId: raw.application_party_id,
      currentStageCode: raw.current_stage_code,
      matchScoreLatest: raw.match_score_latest,
      assignedRecruiterId: raw.assigned_recruiter_id,
      createdAt: raw.created_at,
      message: raw.message,
    };
  },

  saveJob(payload: SaveJobRequest): Promise<unknown> {
    // The collection endpoint takes the job in the body; candidate-scoped
    // deployments that put it in the path still resolve via the template.
    return unwrapResponseData(
      candidateApiClient.post(
        resolveEndpoint(apiEndpoints.candidate.savedJob, {
          candidateId: payload.candidateId,
          jobProfileId: payload.jobProfileId,
        }),
      ),
    );
  },

  removeSavedJob(candidateId: string, jobProfileId: string): Promise<unknown> {
    return unwrapResponseData(
      candidateApiClient.delete(
        resolveEndpoint(apiEndpoints.candidate.savedJob, {
          candidateId,
          jobProfileId,
        }),
      ),
    );
  },

  getRecommendedPositions(candidateId: string): Promise<RecommendedJobsData> {
    return unwrapResponseData(
      candidateApiClient.get<
        RawCandidateJobCollection | RawCandidateJobCollectionEnvelope
      >(
        resolveEndpoint(apiEndpoints.candidate.recommendedJobs, {
          candidateId,
        }),
      ),
    ).then(mapRecommendedResponse);
  },

  getAiActions(candidateId: string): Promise<AiActionsData> {
    return aiApi.getCandidateAiActions(candidateId).then((payload) => {
      return {
        candidateId: payload.candidate_id ?? candidateId,
        actions: payload.actions.map((action, index) => ({
          actionId: `ai-${index}`,
          type: "CAREER_NUDGE" as const,
          label: action.title,
          description: action.description,
          payload: {
            actionType: action.action_type,
            priority: action.priority,
            jobProfileId: action.job_profile_id,
            jobTitle: action.job_title,
            companyName: action.company_name,
            ctaLabel: action.cta_label,
            ctaAction: action.cta_action,
          },
        })),
      };
    });
  },

  buildMyCv(candidateId?: string): Promise<SuccessEnvelope<BuildMyCvData>> {
    return unwrapResponseData(
      candidateApiClient.post(
        resolveEndpoint(apiEndpoints.candidate.buildMyCv, {
          candidateId: candidateId ?? "",
        }),
      ),
    );
  },

  previewResume(resumeId: string): Promise<SuccessEnvelope<CvPreviewData>> {
    return unwrapResponseData(
      candidateApiClient.get(
        resolveEndpoint(apiEndpoints.candidate.resumePreview, { resumeId }),
      ),
    );
  },

  downloadResume(resumeId: string): Promise<SuccessEnvelope<CvDownloadData>> {
    return unwrapResponseData(
      candidateApiClient.get(
        resolveEndpoint(apiEndpoints.candidate.resumeDownload, { resumeId }),
      ),
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
      candidateApiClient.get(apiEndpoints.candidate.recommendedJobs),
    );
  },

  getApplicationById(applicationId: string): Promise<CandidateApplication> {
    return unwrapResponseData(
      apiClient.get<SuccessEnvelope<unknown> | CandidateApplication>(
        resolveEndpoint(apiEndpoints.applications.stageTransition, {
          applicationId,
        }),
      ),
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

  async searchSkills(keyword: string, userId?: string): Promise<UserSkill[]> {
    const payload = await unwrapResponseData(
      apiClient.get<SuccessEnvelope<unknown> | unknown>(
        apiEndpoints.skills.search,
        {
          params: {
            [apiEndpoints.skills.keywordParam]: keyword,
            ...(userId ? { userId } : {}),
          },
        },
      ),
    );
    return normalizeSkillsResponse(payload);
  },

  // AI-generated skill suggestions from the candidate's career history — the
  // caller is expected to overwrite the current skills list with the result.
  async generateSkills(payload: GenerateSkillsRequest): Promise<UserSkill[]> {
    const response = await aiApi.generateCandidateSkills({
      subject_type: "CANDIDATE",
      subject_id: payload.candidateId,
      career_history: payload.careerHistory.map((entry) => ({
        company_name: entry.companyName,
        position_held: entry.positionHeld,
        responsibilities: entry.responsibilities,
        ...(entry.projects ? { projects: entry.projects } : {}),
      })),
    });
    const suggested = response.suggested_skills;
    return suggested.map((skill: Record<string, any>) => ({
      skillId: skill.skill_id ?? skill.skillId ?? "",
      skillName: skill.skill_name ?? skill.skillName ?? "",
      selected: true,
    }));
  },

  async getBuildMyCv(candidateId: string): Promise<BuildMyCvState> {
    const payload = await unwrapResponseData(
      candidateApiClient.get(
        resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId }),
      ),
    );
    return mapBuildResponse(payload) as BuildMyCvState;
  },

  async saveBuildMyCv(
    candidateId: string,
    payload: SaveBuildMyCvRequest,
  ): Promise<BuildMyCvData> {
    return mapBuildMyCvRequest(
      candidateApiClient.post<RawBuildMyCvResponse | RawBuildMyCvEnvelope>(
        resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId }),
        toCvPayload(payload),
      ),
    );
  },

  async updateBuildMyCv(
    candidateId: string,
    payload: UpdateBuildMyCvRequest,
  ): Promise<BuildMyCvData> {
    return mapBuildMyCvRequest(
      candidateApiClient.post<RawBuildMyCvResponse | RawBuildMyCvEnvelope>(
        resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId }),
        toCvPayload(payload),
      ),
    );
  },

  async createSimpleProfile(
    candidateId: string,
    payload: SimpleCandidateProfileInput,
  ): Promise<SimpleCandidateProfileResponse> {
    const raw = await unwrapResponseData(
      candidateApiClient.post(
        resolveEndpoint(apiEndpoints.candidate.profile, { candidateId }),
        {
          personal_details: {
            full_name: payload.personalDetails.fullName,
            email: payload.personalDetails.email,
            phone_number: toSouthAfricaApiPhoneNumber(
              payload.personalDetails.phoneNumber,
            ),
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
    );
    const data = responseData(raw as Record<string, unknown>) as Record<
      string,
      any
    >;
    return {
      candidateId: data.candidate_id ?? data.candidateId ?? candidateId,
      profileStatus: data.profile_status ?? data.profileStatus ?? "ACTIVE",
      message: data.message ?? "",
      createdAt: data.created_at ?? data.createdAt ?? null,
      updatedAt: data.updated_at ?? data.updatedAt ?? null,
    };
  },

  // Resume uploads go through the same generic document endpoint, just pinned to RESUME.
  uploadResumeDocument(
    candidateId: string,
    file: Blob,
    fileName: string,
  ): Promise<ResumeDocumentUploadResult> {
    return this.uploadDocument(candidateId, file, fileName, "RESUME");
  },

  async uploadDocument(
    candidateId: string,
    file: Blob,
    fileName: string,
    documentType = "RESUME",
  ): Promise<ResumeDocumentUploadResult> {
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("owner_type", "CANDIDATE"); // can be visitor if the user has not logged in and applying for a job
    formData.append("owner_id", candidateId);
    formData.append("document_type", documentType);
    formData.append("title", fileName);

    const raw = await unwrapResponseData(
      documentApiClient.post<Record<string, any>>(
        apiEndpoints.documents.upload,
        formData,
      ),
    );
    return {
      ownerId: raw.owner_id_ref ?? candidateId,
      documentId: raw.document_id ?? "",
      title: raw.title ?? fileName,
      fileName: raw.file_name ?? fileName,
      mediaType: raw.media_type ?? file.type,
      sizeBytes: raw.size_bytes ?? file.size,
      lifecycleStatus: raw.lifecycle_status ?? "ACTIVE",
      uploadedAt: raw.updated_at ?? new Date().toISOString(),
    };
  },
};
