export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: unknown
}

export interface ApiResponse<TData> {
  data: TData
  meta?: Record<string, unknown>
}

export interface PaginatedResponse<TData> {
  items: TData[]
  total: number
  page: number
  pageSize: number
}

export interface CandidateSummary {
  id: string
  fullName: string
  primarySkill: string
}

export interface CrmAccountSummary {
  id: string
  name: string
  segment: string
}

export interface DashboardPlaceholder {
  message: string
}

export interface MandateSummary {
  id: string
  title: string
  status: string
}