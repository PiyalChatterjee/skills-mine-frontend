import { apiClient } from '@/services/api/axios'
import type { ApiResponse, DashboardPlaceholder } from '@/types/api'

export const dashboardApi = {
  getSummary: () => apiClient.get<ApiResponse<DashboardPlaceholder>>('/dashboard/summary'),
}
