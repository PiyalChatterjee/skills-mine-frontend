import { apiClient } from '@/services/api/axios'
import type { ApiResponse } from '@/types/api'

export interface MandateSummary {
  id: string
  title: string
  status: string
}

export const mandateApi = {
  list: () => apiClient.get<ApiResponse<MandateSummary[]>>('/mandates'),
}
