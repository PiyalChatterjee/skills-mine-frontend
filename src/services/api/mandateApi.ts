import { apiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import { formatEnumLabel } from "@/app/formatEnumLabel";
import type {
  AtsCandidateProfileData,
  JobPost,
  JobPostsParams,
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
  clientRate?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
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

type IndustryItem = { industryId: string; industryName: string };
type CompanyItem = {
  clientId: string;
  clientName: string;
  contactName: string;
  contactEmail: string;
  contactPhoneNumber: string;
};
type JobProfileSummary = {
  jobProfileId: string;
  jobReferenceNumber: string;
  client: CompanyItem;
  positionTitle: string;
  industry: IndustryItem | null;
  locationText: string;
  employmentType: string | null;
  jobDescriptionSnippet: string | null;
  fillByDate: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
type JobProfile = JobProfileSummary & {
  workType: string | null;
  experienceLevel: string | null;
  priority: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currencyCode: string;
  clientRate: number | null;
  jobDescription: string | null;
  requirements: string[];
  responsibilities: string[];
  benefitsText: string[];
  skills?: Array<{ originalText: string | null }>;
  applicantCount?: number;
  versionNo: number;
};
type JobProfilePage = { data: JobProfileSummary[]; total: number; page: number; size: number };
type DashboardSummary = {
  cvsDue: number;
  interviewsToSchedule: number;
  offerLettersAcceptanceDeadlines: number;
};
type CompanyPage = { data: CompanyItem[]; total: number; page: number; size: number };

const splitBulletLines = (value: string) => value
  .split("\n")
  .map((line) => line.replace(/^\s*[•*-]\s*/, "").trim())
  .filter(Boolean);

const normalizeEnum = (value: string) => value.trim().toUpperCase().replace(/[ -]+/g, "_");
const normalizePriority = (value: string) => {
  const normalized = normalizeEnum(value);
  if (normalized === "MEDIUM") return "NORMAL";
  if (normalized === "URGENT") return "CRITICAL";
  return normalized;
};

const toJobPost = (job: JobProfileSummary | JobProfile): JobPost => {
  const detail = job as JobProfile;
  return {
    mandateId: job.jobProfileId,
    jobId: job.jobReferenceNumber,
    title: job.positionTitle,
    client: job.client?.clientName ?? "",
    clientId: job.client?.clientId ?? "",
    clientRate: detail.clientRate == null ? "" : String(detail.clientRate),
    contactPersonName: job.client?.contactName ?? "",
    contactPersonEmail: job.client?.contactEmail ?? "",
    contactPersonNumber: job.client?.contactPhoneNumber ?? "",
    recruiterId: "",
    recruiterName: "",
    industry: job.industry?.industryName ?? "",
    industries: job.industry ? [job.industry.industryName] : [],
    status: job.status,
    priority: detail.priority === "NORMAL" ? "MEDIUM" : detail.priority ?? "NORMAL",
    openDate: job.publishedAt ?? job.createdAt,
    targetCloseDate: job.fillByDate,
    salaryBand: detail.salaryMin != null && detail.salaryMax != null
      ? `R${detail.salaryMin.toLocaleString()} - R${detail.salaryMax.toLocaleString()}`
      : "",
    salaryMin: detail.salaryMin ?? 0,
    salaryMax: detail.salaryMax ?? 0,
    location: job.locationText,
    workType: formatEnumLabel(detail.workType),
    employmentType: formatEnumLabel(job.employmentType),
    experienceLevel: detail.experienceLevel ?? "",
    eeTarget: false,
    eeRequirement: "",
    jobDescription: detail.jobDescription ?? job.jobDescriptionSnippet ?? "",
    requirements: detail.requirements ?? [],
    responsibilities: detail.responsibilities ?? [],
    benefits: detail.benefitsText ?? [],
    skills: detail.skills?.map((skill) => skill.originalText).filter((skill): skill is string => Boolean(skill)) ?? [],
    jobBoards: [],
    applicantCount: detail.applicantCount ?? 0,
    shortlistedCount: 0,
    interviewCount: 0,
    pipeline: {},
  };
};

const toMandate = (job: JobProfileSummary): RecruiterMandatesData["mandates"][number] => ({
  mandateId: job.jobProfileId,
  jobId: job.jobReferenceNumber,
  title: job.positionTitle,
  client: job.client?.clientName ?? "",
  clientId: job.client?.clientId ?? "",
  recruiterId: "",
  recruiterName: "",
  status: job.status === "PAUSED" ? "ON_HOLD" : job.status === "POSTED" ? "ACTIVE" : "CLOSED",
  priority: "MEDIUM",
  openDate: job.publishedAt ?? job.createdAt,
  targetCloseDate: job.fillByDate,
  salaryBand: "",
  location: job.locationText,
  workType: "",
  employmentType: formatEnumLabel(job.employmentType),
  eeTarget: false,
  eeRequirement: "",
  skills: [],
  applicantCount: 0,
  shortlistedCount: 0,
  interviewCount: 0,
  pipeline: {},
});

const toJobWriteRequest = async (payload: CreateMandateRequest, versionNo?: number) => {
  const industries = await apiClient
    .get<IndustryItem[]>(apiEndpoints.industries.list)
    .then((response) => response.data);
  const selectedIndustry = industries.find((industry) =>
    payload.industries.some((name) => name.toLowerCase() === industry.industryName.toLowerCase()),
  );
  return {
    companyName: payload.companyName,
    contactName: payload.contactName,
    contactEmail: payload.contactEmail,
    contactPhoneNumber: payload.contactPhoneNumber,
    positionTitle: payload.positionTitle,
    locationText: payload.location,
    fillByDate: payload.fillByDate,
    workType: payload.workType ? normalizeEnum(payload.workType).replace("ON_SITE", "ONSITE") : null,
    employmentType: payload.employmentType ? normalizeEnum(payload.employmentType) : null,
    experienceLevel: payload.experienceLevel || null,
    priority: normalizePriority(payload.priority || "NORMAL"),
    salaryMin: payload.salary.minimum,
    salaryMax: payload.salary.maximum,
    currencyCode: "ZAR",
    clientRate: payload.clientRate ? Number(payload.clientRate) : null,
    jobDescription: payload.jobDescription || null,
    requirements: splitBulletLines(payload.requirements),
    responsibilities: splitBulletLines(payload.responsibilities),
    benefitsText: splitBulletLines(payload.benefits),
    industryId: selectedIndustry?.industryId ?? null,
    skills: payload.skills.map((originalText) => ({ originalText, sourceType: "RECRUITER_ENTERED" })),
    ...(versionNo === undefined ? {} : { versionNo }),
  };
};

export const mandateApi = {
  getCompanies(search?: string) {
    return apiClient
      .get<CompanyPage>(apiEndpoints.companies.list, {
        params: { search, page: 0, size: 100 },
      })
      .then((response) => response.data.data);
  },

  getRecruiterDashboard() {
    return apiClient
      .get<DashboardSummary>(apiEndpoints.dashboard.summary)
      .then((response): SuccessEnvelope<RecruiterDashboardData> => ({
        success: true,
        statusCode: 200,
        message: "Dashboard summary retrieved.",
        data: {
          weeklyTodo: [],
          pipeline: [
            { stage: "Inbound", count: response.data.cvsDue },
            { stage: "Interview", count: response.data.interviewsToSchedule },
            { stage: "Offer", count: response.data.offerLettersAcceptanceDeadlines },
          ],
        },
      }));
  },

  listRecruiterMandates(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(0, (params?.page ?? 1) - 1);
    const size = params?.limit ?? 12;
    return apiClient
      .get<JobProfilePage>(apiEndpoints.jobs.list, {
        params: { status: params?.status, page, size },
      })
      .then((response): SuccessEnvelope<RecruiterMandatesData> => ({
        success: true,
        statusCode: 200,
        message: "Mandates retrieved.",
        data: {
          mandates: response.data.data.map(toMandate),
          pagination: {
            page: response.data.page + 1,
            pageSize: response.data.size,
            total: response.data.total,
            totalPages: Math.ceil(response.data.total / response.data.size),
          },
        },
      }));
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
  createJobPost(payload: CreateMandateRequest) {
    return toJobWriteRequest(payload)
      .then((body) => apiClient.post<JobProfile>(apiEndpoints.jobs.list, body))
      .then((response): SuccessEnvelope<{ mandateId: string }> => ({
        success: true,
        statusCode: 201,
        message: "Job post created.",
        data: { mandateId: response.data.jobProfileId },
      }));
  },

  getJobPosts(params?: JobPostsParams) {
    return apiClient
      .get<JobProfilePage>(apiEndpoints.jobs.list, {
        params: {
          search: params?.search,
          status: params?.status,
          page: 0,
          size: 100,
        },
      })
      .then((response): SuccessEnvelope<JobPost[]> => ({
        success: true,
        statusCode: 200,
        message: "Job posts retrieved.",
        data: response.data.data.map(toJobPost),
      }));
  },

  getJobPostDetail(mandateId: string) {
    return apiClient
      .get<JobProfile>(
        resolveEndpoint(apiEndpoints.jobs.details, { jobProfileId: mandateId }),
      )
      .then((response): SuccessEnvelope<JobPost> => ({
        success: true,
        statusCode: 200,
        message: "Job post retrieved.",
        data: toJobPost(response.data),
      }));
  },

  updateJobPost(mandateId: string, payload: CreateMandateRequest) {
    return apiClient
      .get<JobProfile>(resolveEndpoint(apiEndpoints.jobs.details, { jobProfileId: mandateId }))
      .then(async (current) => {
        const body = await toJobWriteRequest(payload, current.data.versionNo);
        if (current.data.status !== "POSTED") return body;
        return {
          positionTitle: body.positionTitle,
          fillByDate: body.fillByDate,
          versionNo: body.versionNo,
          jobDescription: body.jobDescription,
          salaryMin: body.salaryMin,
          salaryMax: body.salaryMax,
        };
      })
      .then((body) => apiClient.put<JobProfile>(
          resolveEndpoint(apiEndpoints.jobs.details, { jobProfileId: mandateId }),
          body,
        ))
      .then((response): SuccessEnvelope<{ mandateId: string }> => ({
        success: true,
        statusCode: 200,
        message: "Job post updated.",
        data: { mandateId: response.data.jobProfileId },
      }));
  },

  deleteJobPost(mandateId: string) {
    return apiClient
      .delete(resolveEndpoint(apiEndpoints.jobs.details, { jobProfileId: mandateId }))
      .then((): SuccessEnvelope<{ mandateId: string }> => ({
        success: true,
        statusCode: 204,
        message: "Job post deleted.",
        data: { mandateId },
      }));
  },
};
