import type {
  CandidateApplication,
  CandidateDashboardData,
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidateProfile,
  DesiredJob,
  PersonalDetails,
} from '@/types/api'

export type {
  CandidateApplication,
  CandidateDashboardData,
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidateProfile,
  DesiredJob,
  PersonalDetails,
}

export type CandidateProfileUpdatePayload = Partial<{
  personalDetails: Partial<PersonalDetails>
  desiredJob: Partial<DesiredJob>
  education: CandidateEducation[]
  experience: CandidateExperience[]
  skills: string[]
  languages: CandidateLanguage[]
}>
