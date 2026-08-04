import { useMemo } from 'react'
import {
  useGetCandidateApplicationsQuery,
  useGetCandidateProfileQuery,
  useUpdateCandidateProfileMutation as useUpdateCandidateProfileRtkMutation,
} from '@/store/api/apiSlice'
import type { CandidateProfileUpdatePayload } from '@/services/api/candidateApi'
import type { ApiError } from '@/types'

export const useCandidateProfileQuery = (
  candidateId?: string,
  enabled = true,
) => {
  return useGetCandidateProfileQuery(candidateId as string, {
    skip: !enabled || !candidateId,
  })
}

export const useCandidateApplicationsQuery = (
  applicationIds: string[] = [],
  enabled = true,
) => {
  const normalizedApplicationIds = useMemo(
    () => applicationIds.filter(Boolean),
    [applicationIds],
  )

  return useGetCandidateApplicationsQuery(normalizedApplicationIds, {
    skip: !enabled || normalizedApplicationIds.length === 0,
  })
}

type UpdateCandidateProfileVariables = {
  candidateId: string
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
