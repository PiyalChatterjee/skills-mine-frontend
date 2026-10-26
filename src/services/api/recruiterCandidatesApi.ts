import { PipelineStageLabel as PipelineLabel } from "@/enums/statuses";
import { candidateApiClient, documentApiClient, mandateApiClient, visitorApiClient } from "@/services/api/axios";
import { apiEndpoints, resolveEndpoint } from "@/services/api/endpoints";
import { toCvPayload } from "@/services/api/candidateApi";
import type { AxiosProgressEvent } from "axios";
import type {
  CandidateListData,
  CandidateListItem,
  CandidateListParams,
  SaveBuildMyCvRequest,
  SuccessEnvelope,
} from "@/types/api";

// ── List response shape ───────────────────────────────────────────────────
type CandidateRow = {
  applicantType: "CANDIDATE" | "VISITOR";
  source: string;
  applicationId: string | null;
  applicantId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  companyName: string;
  locationText: string;
  matchPercentage: number | null;
  status: string | null;
  jobProfileId: string | null;
};

type CandidatePage = {
  data: CandidateRow[];
  total: number;
  page: number;
  size: number;
};

const toCandidateListItem = (candidate: CandidateRow): CandidateListItem => ({
  candidateId: candidate.applicantId,
  fullName: candidate.fullName || [candidate.firstName, candidate.lastName].filter(Boolean).join(" "),
  email: "",
  phone: "",
  location: candidate.locationText,
  currentTitle: candidate.title,
  currentCompany: candidate.companyName,
  experienceYears: 0,
  skills: [],
  education: [],
  experience: [],
  documents: [],
  languages: [],
  profileComplete: 0,
  applications: candidate.applicationId ? [candidate.applicationId] : [],
  applicantType: candidate.applicantType,
  source: candidate.source,
});

// ── GET /candidates/profile/:candidateId  (candidate-service) ────────────
type RawProfilePersonalDetails = {
  first_name?: string;
  last_name?: string;
  email?: string;
  alternate_email?: string | null;
  phone_number?: string | null;
  alternate_phone_number?: string | null;
  residential_location?: string | null;
  nationality?: string | null;
  race?: string | null;
  gender?: string | null;
  disability_status?: string | null;
  current_company?: string | null;
  current_position?: string | null;
  notice_period?: string | null;
};

type RawProfileDesiredJob = {
  role_title?: string | null;
  targeted_industry?: string | null;
  work_type?: string | null;
  employment_type?: string | null;
  availability_code?: string | null;
};

type RawSkill = {
  skill_id?: string;
  skill_name?: string;
};

type RawProfileResponse = {
  candidate_id?: string;
  user_id?: string;
  personal_details?: RawProfilePersonalDetails;
  desired_job?: RawProfileDesiredJob | null;
  skills?: RawSkill[];
};

export type CandidateDashboardApplicationItem = {
  applicationId: string;
  jobProfileId: string;
  jobTitle: string;
  company: string;
  currentStage: string;
};

export type CandidateDashboardStaffResponse = {
  candidateId: string;
  applications: CandidateDashboardApplicationItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type RecruiterCandidateProfile = {
  candidateId: string;
  fullName: string;
  email: string;
  alternateEmail: string;
  phone: string;
  alternatePhone: string;
  location: string;
  currentTitle: string;
  currentCompany: string;
  noticePeriod: string;
  nationality: string;
  race: string;
  gender: string;
  disabilityStatus: string;
  desiredRole: string;
  desiredIndustry: string;
  workType: string;
  employmentType: string;
  availability: string;
  skills: string[];
  profileImageUrl: string;
  // kept for sections rendered below the hero card
  languages: string[];
  experience: { company: string; title: string; startDate: string; endDate: string; responsibilities: string[] }[];
  education: { institution: string; qualification: string; level: string; year: number | null }[];
};

const mapProfileResponse = (raw: RawProfileResponse): RecruiterCandidateProfile => {
  const pd = raw.personal_details ?? {};
  const dj = raw.desired_job ?? {};
  return {
    candidateId:      raw.candidate_id ?? "",
    fullName:         [pd.first_name, pd.last_name].filter(Boolean).join(" "),
    email:            pd.email ?? "",
    alternateEmail:   pd.alternate_email ?? "",
    phone:            pd.phone_number ?? "",
    alternatePhone:   pd.alternate_phone_number ?? "",
    location:         pd.residential_location ?? "",
    currentTitle:     dj.role_title ?? pd.current_position ?? "",
    currentCompany:   pd.current_company ?? "",
    noticePeriod:     pd.notice_period ?? "",
    nationality:      pd.nationality ?? "",
    race:             pd.race ?? "",
    gender:           pd.gender ?? "",
    disabilityStatus: pd.disability_status ?? "",
    desiredRole:      dj.role_title ?? "",
    desiredIndustry:  dj.targeted_industry ?? "",
    workType:         dj.work_type ?? "",
    employmentType:   dj.employment_type ?? "",
    availability:     dj.availability_code ?? "",
    skills:           (raw.skills ?? []).map((s) => s.skill_name ?? "").filter(Boolean),
    profileImageUrl:  "",
    languages:        [],
    experience:       [],
    education:        [],
  };
};

// ── GET /candidates/cv-build/:candidateId ────────────────────────────────────
type RawCvBuildEducationEntry = {
  institution_name?: string;
  qualification?: string;
  level_code?: string; // "TERTIARY" | "SECONDARY"
  year_completed?: number | string | null;
};

type RawCvBuildCareerEntry = {
  company_name?: string;
  employer_name?: string;
  position_held?: string;
  role_title?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean;
  responsibilities?: string | string[];
  responsibilities_text?: string | string[];
  projects?: string[];
};

type RawCvBuildSkill = { skill_id?: string; skill_name?: string } | string;

type RawCvBuildResponse = {
  candidate_id?: string;
  personal_details?: RawProfilePersonalDetails;
  career_history?: RawCvBuildCareerEntry[];
  experience?: RawCvBuildCareerEntry[];
  skills?: RawCvBuildSkill[];
  education?: RawCvBuildEducationEntry[];
  languages?: string[];
};

export type RecruiterCandidateCvBuild = {
  candidateId: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    race: string;
    gender: string;
    disabilityStatus: string;
    nationality: string;
    location: string;
    currentCompany: string;
    currentPosition: string;
    noticePeriod: string;
  };
  careerHistory: {
    companyName: string;
    positionHeld: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    responsibilities: string[];
    projects: string[];
  }[];
  skills: string[];
  tertiaryEducation: { institution: string; qualification: string; yearCompleted: string }[];
  secondaryEducation: { institution: string; qualification: string; yearCompleted: string }[];
  languages: string[];
};

const mapCvBuildResponse = (raw: RawCvBuildResponse): RecruiterCandidateCvBuild => {
  const pd = raw.personal_details ?? {};
  const education = raw.education ?? [];
  return {
    candidateId: raw.candidate_id ?? "",
    personalDetails: {
      firstName:        pd.first_name ?? "",
      lastName:         pd.last_name ?? "",
      email:            pd.email ?? "",
      phoneNumber:      pd.phone_number ?? "",
      race:             pd.race ?? "",
      gender:           pd.gender ?? "",
      disabilityStatus: pd.disability_status ?? "",
      nationality:      pd.nationality ?? "",
      location:         pd.residential_location ?? "",
      currentCompany:   pd.current_company ?? "",
      currentPosition:  pd.current_position ?? "",
      noticePeriod:     pd.notice_period ?? "",
    },
    careerHistory: (raw.career_history ?? raw.experience ?? []).map((entry) => {
      const resp = entry.responsibilities ?? entry.responsibilities_text;
      return {
        companyName:      entry.company_name ?? entry.employer_name ?? "",
        positionHeld:     entry.position_held ?? entry.role_title ?? "",
        startDate:        entry.start_date ?? "",
        endDate:          entry.end_date ?? "",
        isCurrent:        entry.is_current ?? false,
        responsibilities: Array.isArray(resp)
          ? resp
          : resp
            ? [resp]
            : [],
        projects: entry.projects ?? [],
      };
    }),
    skills: (raw.skills ?? [])
      .map((s) => (typeof s === 'string' ? s : (s.skill_name ?? '')))
      .filter(Boolean),
    tertiaryEducation: education
      .filter((e) => (e.level_code ?? "").toUpperCase() === "TERTIARY")
      .map((e) => ({
        institution:   e.institution_name ?? "",
        qualification: e.qualification ?? "",
        yearCompleted: e.year_completed != null ? String(e.year_completed) : "",
      })),
    secondaryEducation: education
      .filter((e) => (e.level_code ?? "").toUpperCase() === "SECONDARY")
      .map((e) => ({
        institution:   e.institution_name ?? "",
        qualification: e.qualification ?? "",
        yearCompleted: e.year_completed != null ? String(e.year_completed) : "",
      })),
    languages: (raw.languages ?? []).filter(Boolean),
  };
};

// ── GET /documents/owner/:ownerType/:ownerId ─────────────────────────────────
export type CandidateDocument = {
  documentId: string;
  fileName: string;
  title: string;
  documentType: string;
  mediaType: string;
  lifecycleStatus: string;
  sizeBytes: number;
  createdAt: string;
  updatedAt: string;
};

type RawDocumentItem = {
  document_id?: string;
  file_name?: string;
  title?: string;
  document_type?: string;
  media_type?: string;
  lifecycle_status?: string;
  size_bytes?: number;
  created_at?: string;
  updated_at?: string;
};

type RawDocumentsResponse = {
  documents: RawDocumentItem[];
  total: number;
};

const mapDocument = (raw: RawDocumentItem): CandidateDocument => ({
  documentId:      raw.document_id      ?? "",
  fileName:        raw.file_name        ?? "",
  title:           raw.title            ?? raw.file_name ?? "",
  documentType:    raw.document_type    ?? "",
  mediaType:       raw.media_type       ?? "",
  lifecycleStatus: raw.lifecycle_status ?? "",
  sizeBytes:       raw.size_bytes       ?? 0,
  createdAt:       raw.created_at       ?? "",
  updatedAt:       raw.updated_at       ?? "",
});

export const recruiterCandidatesApi = {
  listCandidates(
    params?: CandidateListParams,
  ): Promise<SuccessEnvelope<CandidateListData>> {
    const page = Math.max(0, (params?.page ?? 1) - 1);
    const size = params?.limit ?? 100;
    const requestParams: Record<string, unknown> = {
      page,
      size,
      search: params?.search || undefined,
      locationText: params?.location || undefined,
    };
    if (params?.companyName) requestParams.companyName = params.companyName;
    if (params?.status) requestParams.status = params.status;
    if (params?.jobProfileId) requestParams.jobProfileId = params.jobProfileId;

    return mandateApiClient
      .get<CandidatePage>(apiEndpoints.candidates.list, {
        params: requestParams,
      })
      .then((response): SuccessEnvelope<CandidateListData> => ({
        success: true,
        statusCode: 200,
        message: "Candidates retrieved.",
        data: {
          candidates: response.data.data.map(toCandidateListItem),
          pagination: {
            page: response.data.page + 1,
            pageSize: response.data.size,
            total: response.data.total,
            totalPages: Math.ceil(response.data.total / response.data.size),
          },
        },
      }));
  },

  getCandidateProfile(candidateId: string): Promise<RecruiterCandidateProfile> {
    const url = resolveEndpoint(apiEndpoints.candidate.profile, { candidateId });
    return candidateApiClient
      .get<RawProfileResponse>(url)
      .then((res) => mapProfileResponse(res.data));
  },

  getCandidateDashboard(
    candidateId: string,
    params?: { page?: number; size?: number },
  ): Promise<CandidateDashboardStaffResponse> {
    const url = resolveEndpoint(apiEndpoints.candidates.dashboard, { candidateId });
    return candidateApiClient
      .get<{
        candidate_id: string;
        applications: Array<{
          application_id: string;
          job_profile_id_ref: string;
          job_title: string;
          company_name?: string;
          company?: string;
          current_stage_code: string;
          stage_progress?: unknown[];
        }>;
        pagination: {
          current_page: number;
          page_size: number;
          total_items: number;
          total_pages: number;
        };
      }>(url, { params })
      .then((res) => ({
        candidateId: res.data.candidate_id,
        applications: (res.data.applications ?? []).map((app) => {
          // Normalize stage name from CURRENT_STAGE_CODE e.g. "INTERVIEW" -> "Interview"
          const rawStage = app.current_stage_code ?? '';
          const stageFormatted =
            rawStage.charAt(0).toUpperCase() + rawStage.slice(1).toLowerCase();
          return {
            applicationId: app.application_id,
            jobProfileId:  app.job_profile_id_ref,
            jobTitle:      app.job_title,
            company:       app.company_name ?? app.company ?? '',
            currentStage:  stageFormatted || PipelineLabel.INBOUND,
          };
        }),
        pagination: {
          currentPage: res.data.pagination?.current_page ?? 1,
          pageSize:    res.data.pagination?.page_size ?? 10,
          totalItems:  res.data.pagination?.total_items ?? 0,
          totalPages:  res.data.pagination?.total_pages ?? 1,
        },
      }));
  },

  getCandidateCvBuild(candidateId: string): Promise<RecruiterCandidateCvBuild> {
    const url = resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId });
    return candidateApiClient
      .get<RawCvBuildResponse>(url)
      .then((res) => mapCvBuildResponse(res.data));
  },

  // GET /visitors/:visitorId — same CV structure (personal details, experience, skills, education, languages)
  getVisitorCvBuild(visitorId: string): Promise<RecruiterCandidateCvBuild> {
    const url = resolveEndpoint(apiEndpoints.visitor.detail, { visitorId });
    return visitorApiClient
      .get<RawCvBuildResponse>(url)
      .then((res) => mapCvBuildResponse(res.data));
  },

  getDocumentsByOwner(
    ownerType: string,
    ownerId: string,
    documentType?: string,
  ): Promise<CandidateDocument[]> {
    const url = resolveEndpoint(apiEndpoints.documents.owner, { ownerType, ownerId });
    return documentApiClient
      .get<RawDocumentsResponse>(url, { params: documentType ? { document_type: documentType } : undefined })
      .then((res) => (res.data.documents ?? []).map(mapDocument));
  },

  getDocumentDownloadUrl(documentId: string): string {
    return resolveEndpoint(apiEndpoints.documents.download, { documentId });
  },

  fetchDocumentPresignedUrl(documentId: string, disposition: 'inline' | 'attachment' = 'inline'): Promise<string> {
    const url = resolveEndpoint(apiEndpoints.documents.download, { documentId });
    return documentApiClient
      .get<{ presigned_url: string }>(url, { params: { disposition } })
      .then((res) => res.data.presigned_url);
  },

  saveCandidateCvBuild(
    candidateId: string,
    data: SaveBuildMyCvRequest,
  ): Promise<RecruiterCandidateCvBuild> {
    const url = resolveEndpoint(apiEndpoints.candidate.buildMyCv, { candidateId });
    return candidateApiClient
      .post<RawCvBuildResponse>(url, toCvPayload(data))
      .then((res) => mapCvBuildResponse(res.data));
  },

  deleteDocument(documentId: string): Promise<void> {
    const url = resolveEndpoint(apiEndpoints.documents.detail, { documentId });
    return documentApiClient.delete(url).then(() => undefined);
  },

  uploadDocument(params: {
    file: File
    ownerType: string
    ownerId: string
    documentType?: string
    title?: string
    onUploadProgress?: (event: AxiosProgressEvent) => void
  }): Promise<CandidateDocument> {
    const formData = new FormData()
    formData.append('file', params.file)
    formData.append('owner_type', params.ownerType)
    formData.append('owner_id', params.ownerId)
    if (params.documentType) formData.append('document_type', params.documentType)
    if (params.title) formData.append('title', params.title)

    return documentApiClient
      .post<RawDocumentItem>(apiEndpoints.documents.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: params.onUploadProgress,
      })
      .then((res) => mapDocument(res.data))
  },
};

// ── GET /jobs/:jobProfileId ───────────────────────────────────────────────────
// Response is camelCase from the mandate-service
type RawJobSkill = {
  skillId?: string;
  originalText?: string;
  sourceType?: string;
};

type RawJobProfileResponse = {
  jobProfileId?: string;
  jobReferenceNumber?: string;
  positionTitle?: string;
  jobDescription?: string;
  jobDescriptionSnippet?: string;
  employmentType?: string;
  experienceLevel?: string | null;
  workType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currencyCode?: string | null;
  locationText?: string | null;
  publishedAt?: string | null;
  fillByDate?: string | null;
  status?: string;
  priority?: string | null;
  requirements?: string[];
  responsibilities?: string[];
  benefitsText?: string[];
  skills?: RawJobSkill[];
  client?: {
    clientId?: string;
    clientName?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhoneNumber?: string;
    clientRate?: number | null;
  } | null;
  industry?: {
    industryId?: string;
    industryName?: string;
    normalizedKey?: string;
  } | null;
  clientRate?: number | null;
  viewCount?: number | null;
  applicantCount?: number | null;
  daysLeftToFill?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type JobProfile = {
  jobProfileId: string;
  title: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  workType: string;
  minSalary: number | null;
  maxSalary: number | null;
  currencyCode: string;
  location: string;
  publishedAt: string;
  fillByDate: string;
  jobReference: string;
  status: string;
  priority: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  companyName: string;
  industryName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  clientRate: number | null;
  viewCount: number;
  applicantCount: number;
  daysLeftToFill: number | null;
};

const mapJobProfile = (raw: RawJobProfileResponse): JobProfile => ({
  jobProfileId:   raw.jobProfileId      ?? '',
  title:          raw.positionTitle     ?? '',
  description:    raw.jobDescription    ?? raw.jobDescriptionSnippet ?? '',
  employmentType: raw.employmentType    ?? '',
  experienceLevel:raw.experienceLevel   ?? '',
  workType:       raw.workType          ?? '',
  minSalary:      raw.salaryMin         ?? null,
  maxSalary:      raw.salaryMax         ?? null,
  currencyCode:   raw.currencyCode      ?? 'ZAR',
  location:       raw.locationText      ?? '',
  publishedAt:    raw.publishedAt       ?? '',
  fillByDate:     raw.fillByDate        ?? '',
  jobReference:   raw.jobReferenceNumber ?? '',
  status:         raw.status            ?? '',
  priority:       raw.priority          ?? '',
  requirements:   (raw.requirements    ?? []).filter(Boolean),
  responsibilities:(raw.responsibilities ?? []).filter(Boolean),
  benefits:       (raw.benefitsText    ?? []).filter(Boolean),
  skills:         (raw.skills          ?? []).map((s) => s.originalText ?? '').filter(Boolean),
  companyName:    raw.client?.clientName    ?? '',
  industryName:   raw.industry?.industryName ?? '',
  contactName:    raw.client?.contactName   ?? '',
  contactEmail:   raw.client?.contactEmail  ?? '',
  contactPhone:   raw.client?.contactPhoneNumber ?? '',
  clientRate:     raw.client?.clientRate    ?? raw.clientRate ?? null,
  viewCount:      raw.viewCount         ?? 0,
  applicantCount: raw.applicantCount    ?? 0,
  daysLeftToFill: raw.daysLeftToFill    ?? null,
});

export type TopCandidate = {
  candidateId: string;
  applicantType: "CANDIDATE" | "VISITOR";
  source: string;
  fullName: string;
  title: string;
  matchPercentage: number | null;
  status: string | null;
  applicationId: string | null;
};

export const jobProfileApi = {
  getJobProfile(jobProfileId: string): Promise<JobProfile> {
    const url = resolveEndpoint(apiEndpoints.jobs.profileDetails, { jobProfileId });
    return mandateApiClient
      .get<RawJobProfileResponse>(url)
      .then((res) => mapJobProfile(res.data));
  },

  getTopCandidates(jobProfileId: string, page = 0, size = 10): Promise<{ data: TopCandidate[]; total: number }> {
    return mandateApiClient
      .get<{ data: CandidateRow[]; total: number; page: number; size: number }>(
        apiEndpoints.candidates.list,
        { params: { jobProfileId, page, size } },
      )
      .then((res) => ({
        total: res.data.total ?? 0,
        data: (res.data.data ?? []).map((row) => ({
          candidateId:     row.applicantId,
          applicantType:   row.applicantType,
          source:          row.source,
          fullName:        row.fullName || [row.firstName, row.lastName].filter(Boolean).join(" "),
          title:           row.title,
          matchPercentage: row.matchPercentage,
          status:          row.status,
          applicationId:   row.applicationId,
        })),
      }));
  },
};
