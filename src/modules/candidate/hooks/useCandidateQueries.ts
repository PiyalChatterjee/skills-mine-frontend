import { useMemo } from 'react'
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { useStandardQuery } from '@/hooks/useStandardQuery'
import {
  candidateApi,
  type CandidateProfileUpdatePayload,
} from '@/services/api/candidateApi'
import type { CandidateProfile } from '@/store/slices/candidateProfileSlice'
import type { CandidateApplication } from '@/store/slices/candidateApplicationsSlice'
import type { ApiError } from '@/types'

const CANDIDATE_QUERY_ROOT = 'candidate'

export const candidateQueryKeys = {
  all: [CANDIDATE_QUERY_ROOT] as const,
  profile: (candidateId: string) => [CANDIDATE_QUERY_ROOT, 'profile', candidateId] as const,
  applications: (applicationIds: string[]) =>
    [CANDIDATE_QUERY_ROOT, 'applications', ...applicationIds] as const,
}

export const useCandidateProfileQuery = (
  candidateId?: string,
  enabled = true,
) =>
  useStandardQuery<CandidateProfile>(
    candidateQueryKeys.profile(candidateId ?? ''),
    () => candidateApi.getById(candidateId as string),
    {
      enabled: enabled && Boolean(candidateId),
    },
  )

export const useCandidateApplicationsQuery = (
  applicationIds: string[] = [],
  enabled = true,
) => {
  const normalizedApplicationIds = useMemo(
    () => applicationIds.filter(Boolean),
    [applicationIds],
  )

  return useStandardQuery<CandidateApplication[]>(
    candidateQueryKeys.applications(normalizedApplicationIds),
    () => Promise.all(normalizedApplicationIds.map((id) => candidateApi.getApplicationById(id))),
    {
      enabled: enabled && normalizedApplicationIds.length > 0,
    },
  )
}

type UpdateCandidateProfileVariables = {
  candidateId: string
  payload: CandidateProfileUpdatePayload
}

export const useUpdateCandidateProfileMutation = (
  options?: Omit<
    UseMutationOptions<CandidateProfile, ApiError, UpdateCandidateProfileVariables>,
    'mutationFn'
  >,
) => {
  const queryClient = useQueryClient()

  return useMutation<CandidateProfile, ApiError, UpdateCandidateProfileVariables>({
    ...options,
    mutationFn: ({ candidateId, payload }) => candidateApi.updateById(candidateId, payload),
    onSuccess: (updatedProfile, variables, context, mutation) => {
      queryClient.setQueryData(candidateQueryKeys.profile(variables.candidateId), updatedProfile)
      void queryClient.invalidateQueries({
        queryKey: candidateQueryKeys.profile(variables.candidateId),
      })

      options?.onSuccess?.(updatedProfile, variables, context, mutation)
    },
  })
}
