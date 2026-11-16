import { DocumentLifecycleStatus, PipelineStageLabel as PipelineLabel } from "@/enums/statuses";
import {
  publicDocumentApiClient,
  unwrapResponseData,
  visitorApiClient,
} from "./axios";
import { apiEndpoints, resolveEndpoint } from "./endpoints";
import { omitEmptyValues } from "./payloadUtils";
import type {
  ResumeDocumentUploadResult,
  SaveBuildMyCvRequest,
} from "@/types";

type VisitorProfilePayload = SaveBuildMyCvRequest;

type ApplyToJobPayload = {
  visitorId: string;
  jobProfileId: string;
};

type ApplyToJobResponse = {
  application_id?: string;
  visitor_id?: string;
  job_profile_id?: string;
  application_party_id?: string;
  current_stage_code?: string;
  match_score_latest?: number;
  assigned_recruiter_id?: string;
  created_at?: string;
  message?: string;
};

type VisitorProfileResponse = {
  visitor_id?: string;
};

type PublicDocumentRecord = {
  owner_id_ref?: string;
  document_id?: string;
  title?: string;
  file_name?: string;
  media_type?: string;
  size_bytes?: number;
  lifecycle_status?: string;
  updated_at?: string;
};

type PublicDocumentUploadResponse = PublicDocumentRecord & {
  document?: PublicDocumentRecord;
};

type VisitorPersonalDetailsRecord = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  residential_location?: string;
  race?: string;
  gender?: string;
  disability_status?: string;
};

type VisitorEducationRecord = {
  education_id?: string;
  institution_name?: string;
  qualification?: string;
  field_of_study?: string;
  level_code?: string;
  start_date?: string;
  end_date?: string;
  year_completed?: number;
};

type VisitorExperienceRecord = {
  position_id?: string;
  employer_name?: string;
  role_title?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  responsibilities_text?: string;
};

type VisitorSkillRecord = {
  skill_id?: string;
  skill_name?: string;
};

export type VisitorRecordResponse = {
  visitor_id?: string;
  personal_details?: VisitorPersonalDetailsRecord;
  education?: VisitorEducationRecord[];
  experience?: VisitorExperienceRecord[];
  skills?: VisitorSkillRecord[];
  languages?: string[];
  created_at?: string;
  updated_at?: string;
};

export type CheckVisitorEmailResponse = {
  email?: string;
  is_present?: boolean;
  type?: "VISITOR" | "CANDIDATE" | "NOT_FOUND";
};

export type VisitorDashboardApplicationItem = {
  applicationId: string;
  jobProfileId: string;
  jobTitle: string;
  company: string;
  currentStage: string;
};

export type VisitorDashboardStaffResponse = {
  visitorId: string;
  applications: VisitorDashboardApplicationItem[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type RawVisitorDashboardResponse = {
  visitor_id: string;
  applications: Array<{
    application_id: string;
    job_profile_id_ref?: string;
    job_profile_id?: string;
    job_title?: string;
    company_name?: string;
    company?: string;
    current_stage_code?: string;
  }>;
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

// CV builder joins tasks with "; " into a single string; the API wants an array.
const splitResponsibilities = (value?: string): string[] =>
  (value ?? "")
    .split(/;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

const toVisitorProfileRequest = ({
  personalDetails,
  careerHistory,
  skills,
  education,
  languages,
}: VisitorProfilePayload) => ({
  personal_details: {
    first_name: personalDetails?.firstName ?? "",
    last_name: personalDetails?.lastName ?? "",
    email: personalDetails?.email ?? "",
    phone_number: personalDetails?.phoneNumber ?? "",
    residential_location: personalDetails?.location,
    nationality: personalDetails?.nationality,
    race: personalDetails?.race,
    gender: personalDetails?.gender,
    disability_status: personalDetails?.disabilityStatus,
    current_company: personalDetails?.currentCompany,
    current_position: personalDetails?.currentPosition,
    ...omitEmptyValues({
      notice_period: personalDetails?.noticePeriod?.trim(),
    }),
  },
  career_history: careerHistory?.map((entry) => {
    const isCurrent = entry.endDate.toLowerCase() === "present";
    return {
      company_name: entry.company,
      position_held: entry.jobTitle,
      start_date: entry.startDate,
      end_date: isCurrent || !entry.endDate ? null : entry.endDate,
      is_current: isCurrent,
      responsibilities: splitResponsibilities(entry.responsibilities),
      projects: entry.projects ?? [],
    };
  }),
  skills: skills?.map((skill) => ({ skill_name: skill })),
  education: [
    ...(education?.tertiaryEducation ?? []).map((entry) => ({
      institution_name: entry.institution,
      qualification: entry.qualification,
      level_code: "TERTIARY" as const,
      year_completed: entry.yearCompleted,
    })),
    ...(education?.secondaryEducation ?? []).map((entry) => ({
      institution_name: entry.schoolName,
      qualification: entry.qualification,
      level_code: "SECONDARY" as const,
      year_completed: entry.yearCompleted,
    })),
  ],
  languages: languages?.map((entry) => entry.language),
});

export const visitorApi = {
  createProfile(payload: VisitorProfilePayload): Promise<VisitorProfileResponse> {
    return unwrapResponseData(
      visitorApiClient.post<VisitorProfileResponse>(
        apiEndpoints.visitor.profile,
        toVisitorProfileRequest(payload),
      ),
    );
  },

  applyToJob(payload: ApplyToJobPayload): Promise<ApplyToJobResponse> {
    return unwrapResponseData(
      visitorApiClient.post<ApplyToJobResponse>(
        apiEndpoints.visitor.apply,
        {
          visitor_id: payload.visitorId,
          job_profile_id: payload.jobProfileId,
        },
        { timeout: 60000 },
      ),
    );
  },

  async uploadDocument(
    visitorId: string,
    file: Blob,
    fileName: string,
  ): Promise<ResumeDocumentUploadResult> {
    const formData = new FormData();
    formData.append("file", file, fileName);
    formData.append("owner_type", "VISITOR");
    formData.append("owner_id", visitorId);
    formData.append("document_type", "RESUME");
    formData.append("title", fileName);

    const raw = await unwrapResponseData(
      publicDocumentApiClient.post<PublicDocumentUploadResponse>(
        apiEndpoints.documents.uploadPublic,
        formData,
      ),
    );
    const document = raw.document ?? raw;

    return {
      ownerId: raw.owner_id_ref ?? document.owner_id_ref ?? visitorId,
      documentId: document.document_id ?? "",
      title: document.title ?? fileName,
      fileName: document.file_name ?? fileName,
      mediaType: document.media_type ?? file.type,
      sizeBytes: document.size_bytes ?? file.size,
      lifecycleStatus: document.lifecycle_status ?? DocumentLifecycleStatus.ACTIVE,
      uploadedAt:
        document.updated_at ?? raw.updated_at ?? new Date().toISOString(),
    };
  },

  getById(visitorId: string): Promise<VisitorRecordResponse> {
    return unwrapResponseData(
      visitorApiClient.get<VisitorRecordResponse>(
        resolveEndpoint(apiEndpoints.visitor.detail, { visitorId }),
      ),
    );
  },

  getByEmail(email: string): Promise<VisitorRecordResponse> {
    return unwrapResponseData(
      visitorApiClient.get<VisitorRecordResponse>(apiEndpoints.visitor.byEmail, {
        params: { email },
      }),
    );
  },

  checkEmail(email: string): Promise<CheckVisitorEmailResponse> {
    return unwrapResponseData(
      visitorApiClient.get<CheckVisitorEmailResponse>(
        apiEndpoints.visitor.checkEmail,
        { params: { email } },
      ),
    );
  },

  getDashboard(
    visitorId: string,
    params?: { page?: number; size?: number },
  ): Promise<VisitorDashboardStaffResponse> {
    const url = resolveEndpoint(apiEndpoints.visitor.dashboard, { visitorId });
    return unwrapResponseData(
      visitorApiClient.get<RawVisitorDashboardResponse>(url, { params }),
    ).then((res) => ({
      visitorId: res.visitor_id,
      applications: (res.applications ?? []).map((app) => {
        const rawStage = app.current_stage_code ?? '';
        const stageFormatted =
          rawStage.charAt(0).toUpperCase() + rawStage.slice(1).toLowerCase();
        return {
          applicationId: app.application_id,
          jobProfileId:  app.job_profile_id_ref ?? app.job_profile_id ?? '',
          jobTitle:      app.job_title ?? '',
          company:       app.company_name ?? app.company ?? '',
          currentStage:  stageFormatted || PipelineLabel.INBOUND,
        };
      }),
      pagination: {
        currentPage: res.pagination?.current_page ?? 1,
        pageSize:    res.pagination?.page_size ?? 10,
        totalItems:  res.pagination?.total_items ?? 0,
        totalPages:  res.pagination?.total_pages ?? 1,
      },
    }));
  },
};