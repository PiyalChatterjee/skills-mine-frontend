import { apiClient } from '@/services/api/axios'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export interface CandidateSummary {
  id: string
  fullName: string
  primarySkill: string
}

export const candidateApi = {
  list: () =>
    apiClient.get<ApiResponse<PaginatedResponse<CandidateSummary>>>('/candidates'),
}
