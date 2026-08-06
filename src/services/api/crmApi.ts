import { apiClient } from '@/services/api/axios'
import type { ApiResponse, CrmAccountSummary } from '@/types/api'

export const crmApi = {
  listAccounts: () => apiClient.get<ApiResponse<CrmAccountSummary[]>>('/crm/accounts'),
}
