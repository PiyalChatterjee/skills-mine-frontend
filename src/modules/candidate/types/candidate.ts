export interface CandidateEducation {
  institution: string
  qualification: string
  year: number
}

export interface CandidateExperience {
  company: string
  title: string
  from: string
  to: string
}

export interface CandidateDocument {
  docId: string
  type: string
  uploadedAt: string
}

export interface CandidateProfile {
  candidateId: string
  fullName: string
  email: string
  phone: string
  profilePhotoUrl?: string
  password?: string
  location: string
  currentTitle: string
  currentCompany: string
  experienceYears: number
  skills: string[]
  education: CandidateEducation[]
  experience?: CandidateExperience[]
  documents?: CandidateDocument[]
  languages?: string[]
  profileComplete?: number
  applications?: string[]
}

export interface CandidateApplication {
  applicationId: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  company: string
  currentStage: string
  appliedDate: string
  matchScore: number
  coverLetter: string
  isGuest: boolean
  updatedAt: string
}
