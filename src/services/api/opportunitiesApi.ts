import { apiClient } from '@/services/api/axios'
import type { ApiResponse } from '@/types/api'
import type { Opportunity } from '@/types'

const OPPORTUNITIES_ENDPOINT =
  import.meta.env.VITE_OPPORTUNITIES_ENDPOINT ?? '/opportunities'
const OPPORTUNITIES_QUERY_PARAM =
  import.meta.env.VITE_OPPORTUNITIES_QUERY_PARAM ?? 'query'

type OpportunitiesPayload = {
  opportunities?: Opportunity[]
  items?: Opportunity[]
}

const isApiResponse = (data: unknown): data is ApiResponse<Opportunity[]> =>
  typeof data === 'object' && data !== null && 'data' in data

const isOpportunitiesPayload = (data: unknown): data is OpportunitiesPayload =>
  typeof data === 'object' &&
  data !== null &&
  ('opportunities' in data || 'items' in data)

const extractOpportunities = (payload: unknown): Opportunity[] | null => {
  if (Array.isArray(payload)) {
    return payload as Opportunity[]
  }

  if (isApiResponse(payload)) {
    return extractOpportunities(payload.data)
  }

  if (isOpportunitiesPayload(payload)) {
    if (Array.isArray(payload.opportunities)) {
      return payload.opportunities
    }

    if (Array.isArray(payload.items)) {
      return payload.items
    }
  }

  return null
}

export const opportunitiesApi = {
  async list(searchQuery?: string): Promise<Opportunity[]> {
    const normalizedSearchQuery = searchQuery?.trim() ?? ''

    const response = await apiClient.get<
      ApiResponse<Opportunity[]> | Opportunity[] | OpportunitiesPayload
    >(OPPORTUNITIES_ENDPOINT, {
      params: {
        ...(normalizedSearchQuery
          ? { [OPPORTUNITIES_QUERY_PARAM]: normalizedSearchQuery }
          : {}),
      },
    })

    const payload =
      typeof response.data === 'string'
        ? (JSON.parse(response.data) as ApiResponse<Opportunity[]> | Opportunity[] | OpportunitiesPayload)
        : response.data

    const opportunities = extractOpportunities(payload)

    if (opportunities) {
      return opportunities
    }

    // Return a safe empty collection for unexpected payload shapes.
    return []
  },
}
