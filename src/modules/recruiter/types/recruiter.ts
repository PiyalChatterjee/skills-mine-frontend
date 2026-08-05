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

// ── Candidate ──────────────────────────────────────────────────────────
export interface Candidate {
  id: string
  name: string
  title: string
  email: string
  phone: string
  location: string
  matchScore: number       // 0–100
  currentStage: PipelineStage
  closedReason: ClosedReason
  mandateId: string
  stageHistory: StageHistoryEntry[]
  recruiterNotes: RecruiterNote[]
  cvSummary: string
  skills: string[]
  experience: string
  education: string
}

// ── Recruiter Note ─────────────────────────────────────────────────────
export interface RecruiterNote {
  id: string
  text: string
  timestamp: string
  recruiterId: string
  recruiterName: string
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
  stage: PipelineStage        // mandate's own pipeline column
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
