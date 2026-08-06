import { apiClient } from '@/services/api/axios'
import type { ApiResponse, MandateSummary } from '@/types/api'

export const mandateApi = {
  list: () => apiClient.get<ApiResponse<MandateSummary[]>>('/mandates'),
}
