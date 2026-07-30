import { z } from 'zod'
import { apiClient } from '@/services/api/axios'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { CandidateProfile } from '@/store/slices/candidateProfileSlice'
import type { CandidateApplication } from '@/store/slices/candidateApplicationsSlice'

const candidateEducationSchema = z.object({
  institution: z.string(),
  qualification: z.string(),
  year: z.number(),
})

const candidateExperienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  from: z.string(),
  to: z.string(),
})

const candidateDocumentSchema = z.object({
  docId: z.string(),
  type: z.string(),
  uploadedAt: z.string(),
})

const candidateProfileResponseSchema: z.ZodType<CandidateProfile> = z.object({
  candidateId: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string(),
  profilePhotoUrl: z.string().optional(),
  password: z.string().optional(),
  location: z.string(),
  currentTitle: z.string(),
  currentCompany: z.string(),
  experienceYears: z.number(),
  skills: z.array(z.string()),
  education: z.array(candidateEducationSchema),
  experience: z.array(candidateExperienceSchema).optional(),
  documents: z.array(candidateDocumentSchema).optional(),
  languages: z.array(z.string()).optional(),
  profileComplete: z.number().optional(),
  applications: z.array(z.string()).optional(),
})

const candidateApplicationResponseSchema: z.ZodType<CandidateApplication> = z.object({
  applicationId: z.string(),
  candidateId: z.string(),
  candidateName: z.string(),
  jobId: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  currentStage: z.string(),
  appliedDate: z.string(),
  matchScore: z.number(),
  coverLetter: z.string(),
  isGuest: z.boolean(),
  updatedAt: z.string(),
})

export interface CandidateSummary {
  id: string
  fullName: string
  primarySkill: string
}

export type CandidateProfileUpdatePayload = Omit<CandidateProfile, 'candidateId'>

export const candidateApi = {
  list: () =>
    apiClient.get<ApiResponse<PaginatedResponse<CandidateSummary>>>('/candidates'),
  getById: async (candidateId: string): Promise<CandidateProfile> => {
    const response = await apiClient.get<CandidateProfile>(`/candidates/${candidateId}`)
    const parsedProfile = candidateProfileResponseSchema.safeParse(response.data)

    if (!parsedProfile.success) {
      throw new Error('Received an invalid candidate profile payload.')
    }

    return parsedProfile.data
  },
  updateById: async (
    candidateId: string,
    payload: CandidateProfileUpdatePayload,
  ): Promise<CandidateProfile> => {
    const response = await apiClient.put<CandidateProfile>(`/candidates/${candidateId}`, payload)
    const parsedProfile = candidateProfileResponseSchema.safeParse(response.data)

    if (!parsedProfile.success) {
      throw new Error('Received an invalid candidate profile payload.')
    }

    return parsedProfile.data
  },
  getApplicationById: async (applicationId: string): Promise<CandidateApplication> => {
    const response = await apiClient.get<CandidateApplication>(`/candidates/applications/${applicationId}`)
    const parsed = candidateApplicationResponseSchema.safeParse(response.data)

    if (!parsed.success) {
      throw new Error(`Received an invalid application payload for ${applicationId}.`)
    }

    return parsed.data
  },
}
