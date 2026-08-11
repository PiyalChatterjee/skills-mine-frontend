import type { ApiError } from '@/types/api'

export const mapQueryError = (error: unknown): ApiError => {
  if (typeof error === 'object' && error !== null) {
    const e = error as {
      message?: unknown
      code?: unknown
      response?: { status?: number; data?: unknown }
    }
    return {
      message: String(e.message ?? 'Unknown error'),
      code: e.code != null ? String(e.code) : undefined,
      status: typeof e.response?.status === 'number' ? e.response.status : undefined,
      details: e.response?.data ?? null,
    }
  }

  return {
    message: 'Unexpected query error',
    details: null,
  }
}
