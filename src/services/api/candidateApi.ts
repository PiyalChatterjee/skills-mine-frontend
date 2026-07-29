import { z } from 'zod'
import { apiClient } from '@/services/api/axios'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { CandidateProfile } from '@/store/slices/candidateProfileSlice'

const candidateEducationSchema = z.object({
  institution: z.string(),
  qualification: z.string(),
  year: z.number(),
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
}
