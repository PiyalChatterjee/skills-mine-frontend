import { useEffect, useMemo } from 'react'
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useStandardQuery } from '@/hooks/useStandardQuery'
import {
  candidateApi,
  type CandidateProfileUpdatePayload,
} from '@/services/api/candidateApi'
import type { CandidateApplication, CandidateProfile } from '@/modules/candidate/types'
import type { AppDispatch } from '@/store'
import { selectCandidateApplications } from '@/store/selectors/candidateSelectors'
import { setCandidateApplications } from '@/store/slices/candidateApplicationsSlice'
import { setCandidateProfile } from '@/store/slices/candidateProfileSlice'
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
) => {
  const dispatch = useDispatch<AppDispatch>()
  return useStandardQuery<CandidateProfile>(
    candidateQueryKeys.profile(candidateId ?? ''),
    () => candidateApi.getById(candidateId as string),
    {
      enabled: enabled && Boolean(candidateId),
      onSuccess: (profile) => {
        dispatch(setCandidateProfile(profile))
      },
    },
  )
}

export const useCandidateApplicationsQuery = (
  applicationIds: string[] = [],
  enabled = true,
) => {
  const dispatch = useDispatch<AppDispatch>()
  const storedApplications = useSelector(selectCandidateApplications)
  const normalizedApplicationIds = useMemo(
    () => applicationIds.filter(Boolean),
    [applicationIds],
  )

  useEffect(() => {
    if (!normalizedApplicationIds.length && storedApplications.length) {
      dispatch(setCandidateApplications([]))
    }
  }, [dispatch, normalizedApplicationIds, storedApplications.length])

  return useStandardQuery<CandidateApplication[]>(
    candidateQueryKeys.applications(normalizedApplicationIds),
    () => Promise.all(normalizedApplicationIds.map((id) => candidateApi.getApplicationById(id))),
    {
      enabled: enabled && normalizedApplicationIds.length > 0,
      onSuccess: (applications) => {
        dispatch(setCandidateApplications(applications))
      },
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
  const dispatch = useDispatch<AppDispatch>()

  return useMutation<CandidateProfile, ApiError, UpdateCandidateProfileVariables>({
    ...options,
    mutationFn: ({ candidateId, payload }) => candidateApi.updateById(candidateId, payload),
    onSuccess: (updatedProfile, variables, context, mutation) => {
      dispatch(setCandidateProfile(updatedProfile))
      queryClient.setQueryData(candidateQueryKeys.profile(variables.candidateId), updatedProfile)
      void queryClient.invalidateQueries({
        queryKey: candidateQueryKeys.profile(variables.candidateId),
      })

      options?.onSuccess?.(updatedProfile, variables, context, mutation)
    },
  })
}
