import { apiClient } from '@/services/api/axios'
import type { ApiResponse } from '@/types/api'
import type { Opportunity } from '@/types'

const OPPORTUNITIES_ENDPOINT =
  import.meta.env.VITE_OPPORTUNITIES_ENDPOINT ?? '/opportunities'

export const opportunitiesApi = {
  async list(): Promise<Opportunity[]> {
    const response = await apiClient.get<ApiResponse<Opportunity[]> | Opportunity[]>(
      OPPORTUNITIES_ENDPOINT,
    )

    return Array.isArray(response.data) ? response.data : response.data.data
  },
}
