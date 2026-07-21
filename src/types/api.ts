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