import { unwrapResponseData, visitorApiClient } from "./axios";
import { apiEndpoints } from "./endpoints";
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
};