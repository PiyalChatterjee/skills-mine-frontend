import type {
  ApplicationStatus,
  CrmClassification as CrmClassificationValue,
  MandateStatus,
  OfferResponseStatus,
  PipelineStageCode,
  PipelineStageLabel,
  ProfileStatus,
} from "@/enums/statuses";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export interface SuccessEnvelope<TData> {
  success?: boolean;
  status?: string;
  statusCode?: number;
  message?: string;
  data: TData;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  alternateEmail?: string;
  alternateMobileNumber?: string;
  race?: string;
  gender?: string;
  disabilityStatus?: string;
  nationality?: string;
  location?: string;
  currentCompany?: string;
  currentPosition?: string;
  noticePeriod?: string;
  idNumber?: string;
  eeStatus?: string | null;
  profileImageUrl?: string;
  thumbnailUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface DesiredJob {
  jobTitle: string;
  industry: string;
  workType: "Remote" | "Hybrid" | "On-site" | string;
  employmentType: "Permanent" | "Contract" | string;
  salaryExpectation: number;
  currency?: string;
  industries?: string[];
  locations?: string[];
  jobType?: string;
  availableFrom: string;
}

export interface CandidateAuthentication {
  password: string;
  provider: string;
  accountStatus: string;
}

export interface CandidateEducation {
  institution: string;
  qualification: string;
  year: number;
}

export interface ProfileEducation {
  certifications: string[];
  highestEarned: string;
  tertiary?: Array<Record<string, unknown>>;
  secondary?: Record<string, unknown> | null;
}

export interface CandidateExperience {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  responsibilities?: string;
  projects?: string[];
}

export interface CandidateLanguage {
  language: string;
  proficiency: string;
}

export interface CandidateProfile {
  candidateId?: string;
  userId: string;
  accountStatus?: string;
  profileCompleted?: number;
  personalDetails: PersonalDetails;
  desiredJob: DesiredJob;
  education: ProfileEducation | null;
  experience: CandidateExperience[];
  skills: string[];
  languages: CandidateLanguage[];
  authentication?: CandidateAuthentication | null;
  applications?: CandidateApplication[];
  savedJobs?: string[];
  recommendedJobs?: string[];
  resume?: ResumeRef | null;
}

export interface ResumeRef {
  resumeId: string;
  previewUrl: string;
  downloadUrl: string;
  updatedAt: string;
}

export interface CandidateProfileResponse {
  status: string;
  data: {
    candidateId?: string;
    userId?: string;
    accountStatus?: string;
    profileCompleted?: number;
    savedJobs?: Array<string | { jobId: string }>;
    recommendedJobs?: string[];
    personalDetails: PersonalDetails & { userId: string };
    desiredJob: DesiredJob;
    education: ProfileEducation | null;
    experience: CandidateExperience[];
    applications?: CandidateApplication[];
    resume?: ResumeRef | null;
    skills?: string[];
    languages?: CandidateLanguage[];
    authentication?: CandidateAuthentication;
  };
}

export interface CandidateDashboardSummary {
  totalApplications: number;
  submitted: number;
  inProgress: number;
  successful: number;
}

export interface CandidateDashboardActivity {
  jobsAppliedThisWeek: number;
  recruiterProfileViewsThisWeek: number;
  coursesCompletedThisWeek: number;
}

export interface CandidateApplication {
  applicationId: string;
  userId?: string | null;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  cvId?: string;
  sourceChannel?: string;
  currentStage: string;
  appliedDate: string;
  matchScore: number;
  isGuest: boolean;
  updatedAt?: string;
}

export interface DashboardApplication {
  id: string;
  job: {
    id: string;
    title: string;
    company: string;
  };
  stage: string;
  jobStatus?: string;
  statusMessage: string;
  pipeline: string[];
  rejectedAtStage?: string;
}

export interface CandidateDashboardData {
  id?: string;
  candidateId?: string;
  summary: CandidateDashboardSummary;
  activity: CandidateDashboardActivity;
  applications: DashboardApplication[];
  quickLinks: string[];
}

export type CandidateDashboardQuery = {
  page?: number;
  size?: number;
  status?: Extract<
    ApplicationStatus,
    typeof ApplicationStatus.SUBMITTED | typeof ApplicationStatus.ACTIVE | typeof ApplicationStatus.ON_HOLD
  >;
};

export type CandidatePipelineStage = PipelineStageCode;

export type CandidateInternalStage = PipelineStageLabel;

export interface JobsListData {
  showEmployerDetails?: boolean;
  jobs: Job[];
  pagination: Pagination;
}

export interface Job {
  jobId: string;
  jobProfileId?: string;
  title: string;
  company: string;
  location?: string;
  industry?: string;
  employmentType: string;
  workType: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryRange: string;
  description?: string;
  requirements?: string[];
  responsibilities: string[];
  skills?: string[];
  status: string;
  applicationCount: number;
  postedDate: string;
  recruiterId?: string;
  experienceLevel?: string;
  benefitsText?: string[];
  fillByDate?: string;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SaveJobResponse {
  success: boolean;
}

export interface SavedJob {
  jobId: string;
  title: string;
  company: string;
  location?: string;
  industry?: string;
  salaryRange: string;
  workType: string;
  employmentType: string;
  savedAt?: string;
}

export interface UserProfile {
  userId: string;
  authentication?: CandidateAuthentication | null;
  /** API returns an array of job ID strings */
  savedJobs: string[];
  /** API returns an array of recommended job ID strings */
  recommendedJobs: string[];
}

export interface UserSkill {
  skillId: string;
  skillName: string;
  selected: boolean;
  userId?: string;
}

export interface GenerateSkillsCareerHistoryEntry {
  companyName: string;
  positionHeld: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
  responsibilities: string[];
  projects?: string[];
}

export interface GenerateSkillsRequest {
  candidateId?: string;
  subjectType: "CANDIDATE" | "VISITOR";
  visitorRegistration?: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  careerHistory: GenerateSkillsCareerHistoryEntry[];
}

export interface BuildMyCvPersonalDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  race?: string;
  gender?: string;
  disabilityStatus?: string;
  nationality?: string;
  location?: string;
  currentCompany?: string;
  currentPosition?: string;
  noticePeriod?: string;
}

export interface BuildMyCvSecondaryEducationEntry {
  schoolName: string;
  institution?: string;
  qualification: string;
  highestGradePassed?: string;
  yearCompleted: number;
}

export interface BuildMyCvTertiaryEducationEntry {
  institution: string;
  qualification: string;
  fieldOfStudy?: string;
  yearCompleted: number;
}

export interface BuildMyCvEducationSection {
  secondaryEducation: BuildMyCvSecondaryEducationEntry[];
  tertiaryEducation: BuildMyCvTertiaryEducationEntry[];
}

export interface BuildMyCvState {
  candidateId?: string;
  resumeId?: string;
  personalDetails: BuildMyCvPersonalDetails;
  careerHistory: CandidateExperience[];
  skills: string[];
  education: BuildMyCvEducationSection;
  languages: CandidateLanguage[];
  validation: string[];
  extractionStatus?: string;
  createdAt?: string | null;
  lastModified?: string | null;
}

export interface SaveBuildMyCvRequest {
  personalDetails?: BuildMyCvPersonalDetails;
  careerHistory?: CandidateExperience[];
  skills?: string[];
  education?: BuildMyCvEducationSection;
  languages?: CandidateLanguage[];
}

export type UpdateBuildMyCvRequest = SaveBuildMyCvRequest;

export interface BuildMyCvResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: BuildMyCvData;
}

export interface ApplyJobRequest {
  matchScoreLatest?: number;
}

export interface ApplyJobResponse {
  applicationId: string;
  candidateId: string;
  jobProfileId: string;
  applicationPartyId: string;
  currentStageCode: string;
  matchScoreLatest: number;
  assignedRecruiterId?: string;
  createdAt: string;
  message: string;
}

export interface SaveJobRequest {
  candidateId: string;
  jobProfileId: string;
}

export interface BuildMyCvData extends BuildMyCvState {
  resumeId: string;
  currentStep: string;
  completedSteps: string[];
  steps: string[];
  summary: string;
  desiredJob: DesiredJob;
}

export interface CvPreviewData {
  resumeId: string;
  previewUrl: string;
  generatedAt: string;
  expiresIn: number;
}

export interface CvDownloadData {
  resumeId: string;
  downloadUrl: string;
  filename: string;
  generatedAt: string;
  expiresIn: number;
}

export interface CvUploadData {
  applicationId: string;
  documentId: string;
  extractionStatus: string;
  personalDetails: Partial<PersonalDetails>;
  careerHistory: CandidateExperience[];
  skills: string[];
  education: CandidateEducation[];
  languages: CandidateLanguage[];
  validation: {
    isComplete: boolean;
    missingFields: string[];
    warnings: string[];
  };
  uploadedAt: string;
}

export interface ResumeDocumentUploadResult {
  ownerId: string;
  documentId: string;
  title: string;
  fileName: string;
  mediaType: string;
  sizeBytes: number;
  lifecycleStatus: string;
  uploadedAt: string;
}

export interface RecommendedJob {
  jobId: string;
  jobProfileId?: string;
  title: string;
  company: string;
  location: string;
  industry?: string;
  workType: string;
  employmentType?: string;
  salaryRange: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  applicationCount?: number;
  matchScore: number;
  skills: string[];
  postedDate: string;
}

export interface RecommendedJobsData {
  candidateId: string;
  jobs: RecommendedJob[];
  total: number;
}

export type CandidateLandingData = {
  stats: {
    totalJobs: number;
    totalCandidates: number;
    totalPlacements: number;
  };
  featuredJobs: Array<{
    jobId: string;
    title: string;
    company: string;
    location: string;
    workType: string;
    employmentType: string;
    salaryRange?: string;
    skills?: string[];
    postedDate?: string;
  }>;
};

export interface CandidateStatisticsData {
  candidateId: string | null;
  statistics: {
    totalApplications: number;
    successfulApplications: number;
    inProgressApplications: number;
    rejectedApplications: number;
  };
  profileSummary: {
    firstName: string;
    lastName: string;
    email: string;
    profileStatus: string;
  };
  createdAt: string | null;
}


export interface SavedJobsData {
  candidateId: string;
  jobs: Array<RecommendedJob & {
    employmentType?: string;
    savedAt?: string;
  }>;
  total: number;
}

export type AiActionType =
  | "MATCH_SUMMARY"
  | "SKILL_GAP"
  | "CAREER_NUDGE"
  | "SEND_MATCHED_JOBS";

export interface AiAction {
  actionId: string;
  type: AiActionType;
  label: string;
  description?: string;
  payload?: Record<string, unknown> | null;
}

export interface AiActionsData {
  candidateId: string;
  actions: AiAction[];
}

export interface RecruiterDashboardData {
  weeklyTodo: Array<{
    id: string;
    task: string;
    due: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    mandateId: string;
  }>;
  pipeline: Array<{
    stage: string;
    count: number;
  }>;
}

export interface PipelineDashboardStats {
  cvsDue: number;
  interviewsToSchedule: number;
  offerLetterAcceptanceDeadline: number;
  activeJobs: number;
  companiesCount: number;
}

export interface PipelineApplicationJobProfile {
  jobProfileId: string;
  positionTitle: string;
  clientId: string;
  clientName: string;
  fillByDate: string;
  workType: string;
  employmentType: string;
}

export interface PipelineApplicationCandidate {
  candidateId: string | null;
  candidate_id?: string | null;
  visitorId: string;
  firstName: string;
  lastName: string;
}

export interface PipelineApplication {
  applicationId: string;
  applicationPartyId: string;
  jobProfile: PipelineApplicationJobProfile;
  candidate: PipelineApplicationCandidate;
  assignedRecruiterId: string;
  currentStageCode: string;
  sourceCode: string;
  matchScoreLatest: number;
  createdAt: string;
}

export interface PipelinesListData {
  data: PipelineApplication[];
  total: number;
  page: number;
  size: number;
  stageCounters: {
    INBOUND: number;
    SCREENING: number;
    ASSESSMENT: number;
    INTERVIEW: number;
    SHORTLIST: number;
    OFFER: number;
    CLOSED: number;
  };
}

export interface PipelinesListParams {
  jobProfileId?: string;
  stageCode?: string;
  recruiterId?: string;
  q?: string;
  sourceCode?: string;
  scoreMin?: number;
  scoreMax?: number;
  page?: number;
  size?: number;
}

export interface UniversalPipelineItem {
  jobProfileId: string;
  positionTitle: string;
  clientName: string;
  pipelineStatus: string;
  jobStatus: string;
}

export interface UniversalPipelinesData {
  data: UniversalPipelineItem[];
  total: number;
  page: number;
  size: number;
}

export interface RecruiterPipelineJobProfile {
  jobProfileId: string;
  positionTitle: string;
  clientId: string;
  clientName: string;
  fillByDate: string;
  workType: string;
  employmentType: string;
  status: string;
}

export interface RecruiterPipelineCandidate {
  candidateId: string;
  visitorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileStatus: string;
}

export interface RecruiterPipelineOfferDetails {
  offeredSalary: number;
  currencyCode: string;
  startDate: string;
  offerDate: string;
  validUntil: string;
  responseStatus: string;
}

export interface RecruiterPipelineCard {
  applicationId: string;
  applicationPartyId: string;
  jobProfile: RecruiterPipelineJobProfile;
  candidate: RecruiterPipelineCandidate;
  assignedRecruiterId: string;
  currentStageCode: string;
  applicationStatus: string;
  sourceCode: string;
  matchScoreLatest: number;
  offerDetails: RecruiterPipelineOfferDetails | null;
  createdAt: string;
  closedAt: string | null;
  companyIcon: string;
  tone: string;
  stage: string;
}

export interface RecruiterPipelineStage {
  label: string;
  colorClass: string;
  cards: RecruiterPipelineCard[];
}

export type RecruiterPipelineData = RecruiterPipelineStage[];

export interface Mandate {
  mandateId: string;
  jobId: string;
  title: string;
  client: string;
  clientId: string;
  recruiterId: string;
  recruiterName: string;
  status: MandateStatus;
  priority: "HIGH" | "MEDIUM" | "LOW";
  openDate: string;
  targetCloseDate: string;
  salaryBand: string;
  location: string;
  workType: string;
  employmentType: string;
  eeTarget: boolean;
  eeRequirement: string;
  skills: string[];
  applicantCount: number;
  shortlistedCount: number;
  interviewCount: number;
  pipeline: Record<string, number>;
}

export interface RecruiterMandatesData {
  mandates: Mandate[];
  pagination: Pagination;
}

export interface MandateDetail extends Mandate {
  jobDetails?: Job | null;
  applicants: Array<{
    applicationId: string;
    candidateId: string;
    currentStage: string;
    matchScore: number;
    appliedDate: string;
  }>;
}

export interface StageTransitionData {
  applicationId: string;
  candidateId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  currentStage: string;
  matchScore: number;
  stageHistory: Record<
    string,
    {
      enteredAt: string | null;
      exitedAt: string | null;
      notes: string;
      completed: boolean;
    }
  >;
}

export interface ManualStageUpdateRequest {
  stage: string;
  notes?: string;
}

export interface ManualStageUpdateData {
  applicationId: string;
  previousStage: string;
  currentStage: string;
  notes?: string;
  updatedAt: string;
}

export interface PipelineStageUpdateRequest {
  targetStage: string;
  checklist: Record<string, boolean>;
}

export interface PipelineStageUpdateData {
  pipelineId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  previousStage: string;
  currentStage: string;
  checklistItems: Record<string, boolean>;
  updatedAt: string;
  nextTransition?: {
    to: string;
    requiredChecklist: string[];
  };
}

// ── Advance to Interview stage  (POST /pipelines/:applicationId/interview) ────

export interface AdvanceToInterviewRequest {
  toStageCode: typeof PipelineStageCode.INTERVIEW;
  reasonCode?: string;
  notes?: string;
  shortListDetails: {
    offeredSalary: number;
    currencyCode: string;
    offerDate: string;
    validUntil: string;
  };
}

// ── Bulk-move pipeline stage  (PUT /pipelines/jobs/:jobId/stage) ─────────────

export interface PipelineJobStageAdvanceRequest {
  applicationId: string[];
  toStageCode: PipelineStageCode;
  reasonCode?: string;
  notes?: string;
  offerResponseStatus?: OfferResponseStatus;
  outcomeCode?: string;
}

export interface PipelineJobStageAdvanceSucceeded {
  applicationId: string;
  previousStage: string;
  currentStage: string;
  updatedAt: string;
}

export interface PipelineJobStageAdvanceFailed {
  applicationId: string;
  reason: string;
}

export interface PipelineJobStageAdvanceData {
  jobId: string;
  targetStage: string;
  succeeded: PipelineJobStageAdvanceSucceeded[];
  failed: PipelineJobStageAdvanceFailed[];
}

export interface OfferClosedOfferDetails {
  actualSalaryAccepted?: number | null;
  currencyCode?: string;
  offerDate?: string;
  validUntil: string | null;
}

export interface OfferClosedRequest {
  toStageCode: typeof PipelineStageCode.CLOSED;
  reasonCode?: string;
  notes?: string;
  offerResponseStatus: OfferResponseStatus;
  offerDetails: OfferClosedOfferDetails;
}

export interface RecruiterCandidateSearchItem {
  candidateId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  eeStatus: string;
  currentTitle: string;
  skills: string[];
  profileCompleted: number;
  matchScore: number;
}

export interface RecruiterCandidateSearchData {
  candidates: RecruiterCandidateSearchItem[];
  pagination: Pagination;
}

export interface AtsCandidateProfileData {
  candidateId: string;
  userId: string;
  accountStatus: string;
  profileCompleted: number;
  personalDetails: PersonalDetails;
  desiredJob: DesiredJob;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  skills: string[];
  languages: CandidateLanguage[];
  resume?: {
    resumeId: string;
    previewUrl: string;
    downloadUrl: string;
    updatedAt: string;
  };
  applications: CandidateApplication[];
  matchScore: number;
}

export interface CrmClient {
  clientId: string;
  clientName: string;
  status: string;
  contactName?: string | null;
  contactNumber?: string | null;
  emailId?: string | null;
  clientRate?: number | null;
  lastContactDays?: number | null;
  followupDays?: number | null;
  overdueDays?: number | null;
  lastNote?: string | null;
}

export interface CrmClientsData {
  summary: {
    needsAttention: number;
    hotLeads: number;
    warmContacts: number;
    coldLeads: number;
  };
  clients: CrmClient[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type CrmClassification = CrmClassificationValue;

export interface CrmClientsParams {
  status?: CrmClassification;
  search?: string;
  page?: number;
  size?: number;
}

export interface AddCrmNoteRequest {
  classification: CrmClassification;
  followupDate?: string;
  lastcontactDate?: string;
  note: string;
}

export interface AddCrmNoteData extends Omit<CrmClient, "lastNote"> {
  note?: string;
  timestamp?: string;
}

export interface CreateCrmEmployerRequest {
  employerName: string;
  contactName: string;
  contactNumber: string;
  emailId: string;
  clientRate?: number;
}

export interface CrmEmployerDetail extends Pick<
  CrmClient,
  "clientId" | "clientName" | "contactName" | "contactNumber" | "emailId" | "status" | "clientRate"
> {
  createdAt?: string;
}

export interface MancoDashboardData {
  alerts: Array<{
    alertId: string;
    type: "MANDATE_STALE" | "EE_COMPLIANCE";
    severity: "WARNING" | "INFO";
    message: string;
    mandateId: string;
    daysOpen?: number;
  }>;
  recruiters: Array<{
    recruiterId: string;
    name: string;
    email: string;
    specialisation: string[];
    metrics: {
      placements: number;
      activeRoles: number;
      candidates: number;
      conversionRate: number;
    };
    activeMandates: number;
  }>;
  sortedBy: string;
  summary: {
    totalActiveMandates: number;
    totalCandidatesInPipeline: number;
    placementsThisQuarter: number;
    revenueYTD: number;
    avgTimeToPlace: number;
  };
}

export interface RecruiterPerformanceData {
  recruiterId: string;
  name: string;
  email: string;
  specialisation: string[];
  metrics: {
    placements: number;
    activeRoles: number;
    candidates: number;
    conversionRate: number;
    avgDaysToPlace: number;
    revenueYTD: number;
  };
  kpiTrend: Array<{
    month: string;
    placements: number;
    revenue: number;
  }>;
  jobsManaged: number;
  activeMandates: number;
  closedMandates: number;
}

// ── Candidate List (GET /candidates) ───────────────────────────────────────
export interface CandidateListEducation {
  institution: string
  qualification: string
  year: number
}

export interface CandidateListExperience {
  company: string
  title: string
  from: string
  to: string
}

export interface CandidateListDocument {
  docId: string
  type: string
  uploadedAt: string
}

export interface CandidateListItem {
  candidateId: string
  applicantType?: "CANDIDATE" | "VISITOR"
  source?: string
  fullName: string
  email: string
  phone: string
  location: string
  currentTitle: string
  currentCompany: string
  experienceYears: number
  skills: string[]
  education: CandidateListEducation[]
  experience: CandidateListExperience[]
  documents: CandidateListDocument[]
  languages: string[]
  profileComplete: number
  applications: string[]
}

export interface CandidateListParams {
  page?: number
  limit?: number
  search?: string
  location?: string
  skill?: string
  companyName?: string
  status?: string
  jobProfileId?: string
}

export interface CandidateListData {
  candidates: CandidateListItem[]
  pagination: Pagination
}

export interface JobPost {
  mandateId: string
  jobId: string
  title: string
  client: string
  clientId: string
  clientRate?: string
  contactPersonName?: string
  contactPersonEmail?: string
  contactPersonNumber?: string
  recruiterId: string
  recruiterName: string
  industry: string
  industries: string[]
  status: string
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string
  openDate: string
  targetCloseDate: string
  salaryBand: string
  salaryMin: number
  salaryMax: number
  location: string
  workType: string
  employmentType: string
  experienceLevel: string
  eeTarget: boolean
  eeRequirement: string
  jobDescription: string
  requirements: string[]
  responsibilities: string[]
  benefits: string[]
  skills: string[]
  jobBoards: string[]
  applicantCount: number
  shortlistedCount: number
  interviewCount: number
  pipeline: Record<string, number>
}

export interface JobPostsParams {
  status?: string
  priority?: string
  recruiterId?: string
  search?: string
  locationText?: string[]
  clientId?: string
}

export interface Industry {
  industryId: string
  name: string
}

export interface SimpleCandidateProfileInput {
  personalDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
    residentialLocation: string;
  };
  jobDetails: {
    preferredJobTitle: string;
    targetedIndustries: string;
    preferredLocation: "REMOTE" | "HYBRID" | "ONSITE";
    employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "INTERNSHIP" | "FREELANCE";
    availability: "IMMEDIATELY" | "2_WEEKS" | "1_MONTH" | "2_MONTHS" | "3_MONTHS" | "NOTICE_REQUIRED";
  };
  experience?: {
    currentJobTitle?: string;
    currentEmployer?: string;
    totalYearsExperience?: number;
  } | null;
}

export interface SimpleCandidateProfileResponse {
  candidateId: string;
  profileStatus: ProfileStatus;
  message: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}
