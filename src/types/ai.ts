export type AiSubjectType = "CANDIDATE" | "VISITOR";

export interface ResumeParseRequest {
  extracted_text: string;
  owner_type?: AiSubjectType;
}

export interface ResumeParseResponse {
  visitor_id?: string;
  personal_details?: Record<string, string | null> | null;
  career_history?: Array<Record<string, unknown>> | null;
  education?: Record<string, unknown> | null;
  job_preferences?: Record<string, unknown> | null;
}

export interface AiSuggestedSkill {
  skill_id: string;
  skill_name: string;
}

export interface VisitorRegistration {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface GenerateCandidateSkillsRequest {
  subject_type: AiSubjectType;
  subject_id?: string;
  input_source: "PROFILE" | "OCR";
  visitor_registration?: VisitorRegistration;
  career_history: Array<Record<string, unknown>>;
}

export interface CandidateSkillGenerationResponse {
  ai_generation_run_id: string;
  use_case_code: "CANDIDATE_SKILL_GENERATION" | "VISITOR_SKILL_GENERATION";
  subject_id: string;
  visitor_created?: boolean | null;
  suggested_skills: AiSuggestedSkill[];
  generated_at: string;
}

export interface GenerateJobSkillsRequest {
  company_name: string;
  position_title: string;
  fill_by_date: string;
  responsibilities: string[];
  job_description?: string | null;
  requirements?: string[] | null;
  experience_level?: string | null;
}

export interface JobSkillGenerationResponse {
  ai_generation_run_id: string;
  job_profile_id: string;
  job_status: "DRAFT";
  suggested_skills: AiSuggestedSkill[];
  generated_at: string;
}

export type AiServiceActionType =
  | "MOVE_TO_NEXT_STAGE"
  | "REQUEST_MISSING_SKILLS"
  | "SCHEDULE_INTERVIEW"
  | "SEND_ASSESSMENT"
  | "MAKE_OFFER"
  | "UPDATE_MATCH_SCORE"
  | "REVIEW_OTHER_CANDIDATES"
  | "COMPLETE_CANDIDATE_PROFILE";

export interface AiActionResponseItem {
  action_type: AiServiceActionType;
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  job_profile_id?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  cta_label: string;
  cta_action: string;
}

export interface AiActionsResponse {
  candidate_id: string;
  actions: AiActionResponseItem[];
  generated_at?: string | null;
  saved_at?: string | null;
}