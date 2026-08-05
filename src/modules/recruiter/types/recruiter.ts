// ── Pipeline Stages ────────────────────────────────────────────────────
export type PipelineStage =
  | 'Inbound'
  | 'Screening'
  | 'Assessment'
  | 'Interview'
  | 'Shortlist'
  | 'Offer'
  | 'Closed'

export type ClosedReason = 'Hired' | 'Rejected' | null

// ── Stage History Entry ────────────────────────────────────────────────
export interface StageHistoryEntry {
  from: PipelineStage
  to: PipelineStage
  timestamp: string        // ISO 8601
  recruiterId: string
  recruiterName: string
  note?: string
}

// ── Recruiter Note ─────────────────────────────────────────────────────
export interface RecruiterNote {
  id: string
  text: string
  timestamp: string
  recruiterId: string
  recruiterName: string
}

// ── Document ───────────────────────────────────────────────────────────
export interface CandidateDocument {
  id: string
  name: string
  type: 'CV' | 'Degree' | 'Portfolio' | 'Certificate' | 'Other'
  url: string              // mock URL
  uploadedBy: 'candidate' | 'recruiter'
  uploadedAt: string
}

// ── Application ────────────────────────────────────────────────────────
export interface CandidateApplication {
  id: string
  mandateId: string
  jobTitle: string
  company: string
  currentStage: PipelineStage
  stageColor: string       // badge color
}

// ── Education Entry ────────────────────────────────────────────────────
export interface EducationEntry {
  institution: string
  qualification: string
  field: string
  year: string
}

// ── Experience Entry ───────────────────────────────────────────────────
export interface ExperienceEntry {
  company: string
  role: string
  period: string
  description: string
}

// ── Certification ──────────────────────────────────────────────────────
export interface Certification {
  name: string
  issuer: string
  year: string
}

// ── Match Breakdown ────────────────────────────────────────────────────
export interface MatchBreakdown {
  overall: number
  skills: number
  experience: number
  qualification: number
}

// ── Candidate ──────────────────────────────────────────────────────────
export interface Candidate {
  id: string
  name: string
  title: string
  email: string
  phone: string
  location: string
  matchScore: number
  matchBreakdown: MatchBreakdown
  currentStage: PipelineStage
  closedReason: ClosedReason
  mandateId: string
  stageHistory: StageHistoryEntry[]
  recruiterNotes: RecruiterNote[]
  // Profile sections
  cvSummary: string
  skills: string[]
  educationList: EducationEntry[]
  experienceList: ExperienceEntry[]
  certifications: Certification[]
  languages: string[]
  desiredJob: string
  references?: string
  // Documents & Applications
  documents: CandidateDocument[]
  applications: CandidateApplication[]
  // Legacy flat fields kept for backwards compat
  experience: string
  education: string
}

// ── Mandate ────────────────────────────────────────────────────────────
export interface Mandate {
  id: string
  title: string
  company: string
  companyIcon: string
  employmentType: string
  experience: string
  salary: string
  jobPublished: string
  jobReference: string
  stage: PipelineStage
  status: 'Posted' | 'Draft' | 'Closed'
  views: number
  applicants: number
  transformationApplicants: number
  postedOn: PostedOnSite[]
  jobDetails: string
}

export interface PostedOnSite {
  name: string
  color: string
  label: string
}

// ── Pipeline Column Counts ─────────────────────────────────────────────
export type StageCounts = Record<PipelineStage, number>
