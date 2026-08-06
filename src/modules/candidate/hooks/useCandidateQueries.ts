import {
  useGetCandidateDashboardQuery,
  useGetCandidateProfileQuery,
  useUpdateCandidateProfileMutation as useUpdateCandidateProfileRtkMutation,
} from '@/store/api/apiSlice'
import type { CandidateProfileUpdatePayload } from '@/modules/candidate/types'
import type { ApiError } from '@/types'

export const useCandidateProfileQuery = (
  userId?: string,
  enabled = true,
) => {
  return useGetCandidateProfileQuery(userId as string, {
    skip: !enabled || !userId,
  })
}

export const useCandidateDashboardQuery = (enabled = true) =>
  useGetCandidateDashboardQuery(undefined, { skip: !enabled })

type UpdateCandidateProfileVariables = {
  userId: string
  payload: CandidateProfileUpdatePayload
}

export const useUpdateCandidateProfileMutation = (
  _options?: unknown,
) => {
  const [trigger, result] = useUpdateCandidateProfileRtkMutation()

  return {
    ...result,
    mutateAsync: async (variables: UpdateCandidateProfileVariables) => {
      try {
        return await trigger(variables).unwrap()
      } catch (error) {
        const mappedError = mapApiError(error)
        throw mappedError
      }
    },
  }
}

const mapApiError = (error: unknown): ApiError => {
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
