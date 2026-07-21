import type { ApiError } from '@/types/api'

export const mapQueryError = (error: unknown): ApiError => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return {
      message: String((error as { message?: unknown }).message ?? 'Unknown error'),
      details: error,
    }
  }

  return {
    message: 'Unexpected query error',
    details: error,
  }
}
