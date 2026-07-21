import { apiClient } from '@/services/api/axios'
import type { ApiResponse } from '@/types/api'

export interface CrmAccountSummary {
  id: string
  name: string
  segment: string
}

export const crmApi = {
  listAccounts: () => apiClient.get<ApiResponse<CrmAccountSummary[]>>('/crm/accounts'),
}
