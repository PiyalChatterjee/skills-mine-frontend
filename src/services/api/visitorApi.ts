import { unwrapResponseData, visitorApiClient } from "./axios";
import { apiEndpoints, resolveEndpoint } from "./endpoints";
import type { SaveBuildMyCvRequest } from "@/types";

type VisitorProfilePayload = SaveBuildMyCvRequest & {
  visitorId: string;
  email: string;
  phoneNumber: string;
};

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

const toVisitorProfileRequest = ({
  visitorId,
  email,
  phoneNumber,
  personalDetails,
  careerHistory,
  skills,
  education,
  languages,
}: VisitorProfilePayload) => ({
  personal_details: {
    visitor_id: visitorId,
    first_name: personalDetails?.firstName ?? "",
    last_name: personalDetails?.lastName ?? "",
    email,
    phone_number: phoneNumber,
    residential_location: personalDetails?.location,
    nationality: personalDetails?.nationality,
    race: personalDetails?.race,
    gender: personalDetails?.gender,
    disability_status: personalDetails?.disabilityStatus,
    current_company: personalDetails?.currentCompany,
    current_position: personalDetails?.currentPosition,
    notice_period: personalDetails?.noticePeriod,
  },
  career_history: careerHistory?.map((entry) => ({
    company_name: entry.company,
    position_held: entry.jobTitle,
    start_date: entry.startDate,
    end_date: entry.endDate,
    is_current: entry.endDate.toLowerCase() === "present",
    responsibilities: entry.responsibilities ?? "",
  })),
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
      ),
    );
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
};