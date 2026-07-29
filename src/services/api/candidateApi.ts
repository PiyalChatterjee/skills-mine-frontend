import { apiClient } from '@/services/api/axios'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { CandidateProfile } from '@/store/slices/candidateProfileSlice'

export interface CandidateSummary {
  id: string
  fullName: string
  primarySkill: string
}

export const candidateApi = {
  list: () =>
    apiClient.get<ApiResponse<PaginatedResponse<CandidateSummary>>>('/candidates'),
  getById: async (candidateId: string): Promise<CandidateProfile> => {
    const response = await apiClient.get<CandidateProfile>(`/candidates/${candidateId}`)
    return response.data
  },
}
