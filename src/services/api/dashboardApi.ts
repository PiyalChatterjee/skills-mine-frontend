import { apiClient } from '@/services/api/axios'
import type { ApiResponse } from '@/types/api'

export interface DashboardPlaceholder {
  message: string
}

export const dashboardApi = {
  getSummary: () => apiClient.get<ApiResponse<DashboardPlaceholder>>('/dashboard/summary'),
}
