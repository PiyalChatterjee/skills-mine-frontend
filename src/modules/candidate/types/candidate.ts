import type {
  CandidateAuthentication,
  CandidateApplication,
  CandidateDashboardData,
  CandidateDashboardQuery,
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidateProfile,
  DesiredJob,
  PersonalDetails,
  ProfileEducation,
} from '@/types/api'

export type {
  CandidateAuthentication,
  CandidateApplication,
  CandidateDashboardData,
  CandidateDashboardQuery,
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidateProfile,
  DesiredJob,
  PersonalDetails,
  ProfileEducation,
}

export type CandidateProfileUpdatePayload = Partial<{
  personalDetails: Partial<PersonalDetails>
  desiredJob: Partial<DesiredJob>
  education: ProfileEducation
  experience: CandidateExperience[]
  skills: string[]
  languages: CandidateLanguage[]
}>
