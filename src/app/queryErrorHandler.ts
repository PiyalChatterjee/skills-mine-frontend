import { extractErrorCode, extractErrorMessage, getErrorStatus } from '@/app/errorUtils'
import type { ApiError } from '@/types/api'

export const mapQueryError = (error: unknown): ApiError => {
  if (typeof error === 'object' && error !== null) {
    const e = error as {
      message?: unknown
      code?: unknown
      details?: unknown
      response?: { data?: unknown }
    }
    return {
      message: extractErrorMessage(error, 'Unknown error'),
      code: extractErrorCode(error) ?? (e.code != null ? String(e.code) : undefined),
      status: getErrorStatus(error),
      details: e.response?.data ?? e.details ?? null,
    }
  }

  return {
    message: 'Unexpected query error',
    details: null,
  }
}
