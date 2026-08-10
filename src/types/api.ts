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
  mobileNumber: string;
  location: string;
  nationality: string;
  idNumber: string;
  eeStatus: string;
  profileImageUrl: string;
  thumbnailUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
}

export interface DesiredJob {
  jobTitle: string;
  industry: string;
  workType: "Remote" | "Hybrid" | "On-site" | string;
  employmentType: "Permanent" | "Contract" | string;
  salaryExpectation: number;
  availableFrom: string;
}

export interface CandidateEducation {
  institution: string;
  qualification: string;
  year: number;
}

export interface CandidateExperience {
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  responsibilities?: string;
}

export interface CandidateLanguage {
  language: string;
  proficiency: string;
}

export interface CandidateProfile {
  candidateId?: string;
  userId: string;
  personalDetails: PersonalDetails;
  desiredJob: DesiredJob;
  education: CandidateEducation[];
  experience: CandidateExperience[];
  skills: string[];
  languages: CandidateLanguage[];
}

export interface CandidateProfileResponse {
  status: string;
  data: {
    personalDetails: PersonalDetails & { userId: string };
    desiredJob: DesiredJob;
    education: CandidateEducation[];
    experience: CandidateExperience[];
    skills?: string[];
    languages?: CandidateLanguage[];
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
  statusMessage: string;
  pipeline: string[];
  isOfferAccepted?: boolean;
}

export interface CandidateDashboardData {
  id?: string;
  candidateId?: string;
  summary: CandidateDashboardSummary;
  activity: CandidateDashboardActivity;
  applications: DashboardApplication[];
  quickLinks: string[];
}

export interface JobsListData {
  showEmployerDetails?: boolean;
  jobs: Job[];
  pagination: Pagination;
}

export interface Job {
  jobId: string;
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
  skills?: string[];
  status: "Open" | "Closed" | "Draft" | string;
  applicationCount: number;
  postedDate: string;
  recruiterId?: string;
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
  savedJobs: SavedJob[];
}

export interface UserSkill {
  skillId: string;
  skillName: string;
  selected: boolean;
  userId?: string;
}

export interface BuildMyCvPersonalDetails {
  firstName?: string;
  lastName?: string;
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
  qualification: string;
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
  resumeId?: string;
  personalDetails: BuildMyCvPersonalDetails;
  careerHistory: CandidateExperience[];
  skills: string[];
  education: BuildMyCvEducationSection;
  languages: CandidateLanguage[];
  validation: string[];
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
  candidateId?: string;
  cvId?: string;
  sourceChannel?: string;
}

export interface ApplyJobResponse {
  applicationId: string;
  matchScore: number;
  status: string;
  nextStep: "view_dashboard" | "account_prompt" | string;
}

export interface BuildMyCvData {
  resumeId: string;
  currentStep: string;
  completedSteps: string[];
  steps: string[];
  personalDetails: PersonalDetails;
  careerHistory: CandidateExperience[];
  skills: string[];
  education: CandidateEducation[];
  languages: CandidateLanguage[];
  summary: string;
  desiredJob: DesiredJob;
  createdAt?: string | null;
  lastModified?: string | null;
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

export interface RecommendedJob {
  jobId: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  salaryRange: string;
  matchScore: number;
  skills: string[];
  postedDate: string;
}

export interface RecommendedJobsData {
  candidateId: string;
  jobs: RecommendedJob[];
  total: number;
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

export interface Mandate {
  mandateId: string;
  jobId: string;
  title: string;
  client: string;
  clientId: string;
  recruiterId: string;
  recruiterName: string;
  status: "ACTIVE" | "CLOSED" | "ON_HOLD";
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
  company: string;
  status: "hot_lead" | "warm_contact" | "cold_lead" | "needs_attention";
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
  lastContactDays?: number;
  overdueDays?: number;
  dealValue?: number;
  mandatesOpen?: number;
  notes?: Array<{
    noteId: string;
    note: string;
    noteType?: string;
    addedBy: string;
    addedAt: string;
  }>;
}

export interface CrmClientsData {
  summary: {
    hot_lead: number;
    warm_contact: number;
    cold_lead: number;
    needs_attention: number;
    total: number;
  };
  clients: CrmClient[];
  pagination: Pagination;
}

export interface AddCrmNoteRequest {
  note: string;
  noteType?: string;
  newStatus?: CrmClient["status"];
}

export interface AddCrmNoteData {
  clientId: string;
  noteId: string;
  noteType: string;
  addedBy: string;
  addedAt: string;
  previousStatus?: CrmClient["status"];
  currentStatus: CrmClient["status"];
  totalNotes: number;
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
