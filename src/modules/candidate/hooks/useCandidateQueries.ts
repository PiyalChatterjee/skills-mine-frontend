import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from '@/app/auth/AuthContext'
import {
  useGetCandidateDashboardQuery,
  useGetCandidateProfileQuery,
  useGetCandidateStatisticsQuery,
  useGetUserProfileQuery,
  useSaveJobMutation,
  useSearchSkillsQuery,
  useGetBuildMyCvQuery,
  useGetSavedJobsQuery,
  useGetRecommendedPositionsQuery,
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
  useUpdateCandidateProfileMutation as useUpdateCandidateProfileRtkMutation,
} from '@/store/api/apiSlice'
import { setSavedJobs, setRecommendedJobs, setAvailableSkills, setBuildMyCv, setBuildMyCvExists, setBuildMyCvLastModified } from '@/store/slices/candidateSlice'
import type { CandidateProfileUpdatePayload } from '@/modules/candidate/types'
import type { ApiError, BuildMyCvData, BuildMyCvState, SaveBuildMyCvRequest, UpdateBuildMyCvRequest } from '@/types'
import type { AppDispatch } from '@/store'

/**
 * Identity used to address candidate-owned resources.
 *
 * The backend resolves the candidate from the bearer token, and `candidateId`
 * only becomes known once a candidate-scoped response (dashboard/profile) has
 * been read. Falling back to `userId` keeps the request cache keyed per user so
 * candidate screens are not blocked waiting for an id the session never carries.
 */
export const useCandidateResourceId = (): string => {
  const { user } = useAuth()
  return user?.candidateId ?? user?.userId ?? ''
}


export const useCandidateProfileQuery = (
  candidateId?: string,
  userId?: string,
  enabled = true,
) => {
  const fallbackId = useCandidateResourceId()
  const resolvedId = candidateId || fallbackId

  return useGetCandidateProfileQuery({ candidateId: resolvedId, userId }, {
    skip: !enabled || !resolvedId,
  })
}

export const useCandidateDashboardQuery = (enabled = true) =>
  useGetCandidateDashboardQuery({}, { skip: !enabled })

// Historical stats for the welcome banner (total/successful/in-progress applications).
// No client-side calculation — values are mapped directly from the API response.
export const useCandidateStatisticsQuery = (enabled = true) =>
  useGetCandidateStatisticsQuery(undefined, { skip: !enabled })

type UpdateCandidateProfileVariables = {
  userId: string
  payload: CandidateProfileUpdatePayload
}

export const useUpdateCandidateProfileMutation = () => {
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

// Fetches UserProfile (savedJobs) and hydrates Redux candidate slice
export const useUserProfile = (userId?: string) => {
  const dispatch = useDispatch<AppDispatch>()
  const result = useGetUserProfileQuery(userId as string, { skip: !userId })

  useEffect(() => {
    if (result.data) {
      dispatch(setSavedJobs(result.data.savedJobs))
      dispatch(setRecommendedJobs(result.data.recommendedJobs ?? []))
    }
  }, [dispatch, result.data])

  return result
}

export const useSaveJob = () => useSaveJobMutation()

export const useSavedJobsQuery = (enabled = true, candidateId?: string) => {
  const dispatch = useDispatch<AppDispatch>()
  const fallbackId = useCandidateResourceId()
  const resolvedId = candidateId || fallbackId
  const result = useGetSavedJobsQuery({ candidateId: resolvedId }, { skip: !enabled || !resolvedId })

  useEffect(() => {
    if (result.data) {
      dispatch(setSavedJobs(result.data.jobs.map((job) => job.jobId)))
    }
  }, [dispatch, result.data])

  return result
}

export const useRecommendedPositionsQuery = (enabled = true, candidateId?: string) => {
  const fallbackId = useCandidateResourceId()
  const resolvedId = candidateId || fallbackId

  return useGetRecommendedPositionsQuery(
    { candidateId: resolvedId },
    { skip: !enabled || !resolvedId },
  )
}

// Fetches skills search results and hydrates Redux available/selected skills
export const useSkillsSearch = (keyword: string, userId?: string, enabled = true) => {
  const dispatch = useDispatch<AppDispatch>()
  const result = useSearchSkillsQuery({ keyword, userId }, { skip: !enabled || keyword.length < 1 })

  useEffect(() => {
    if (result.data) {
      dispatch(setAvailableSkills(result.data))
    }
  }, [dispatch, result.data])

  return result
}

// Fetches CV builder state and hydrates Redux buildMyCv slice
export const useBuildMyCvQuery = (enabled = true, candidateId?: string) => {
  const dispatch = useDispatch<AppDispatch>()
  const fallbackId = useCandidateResourceId()
  const resolvedId = candidateId || fallbackId
  const result = useGetBuildMyCvQuery(
    { candidateId: resolvedId },
    { skip: !enabled || !resolvedId, refetchOnMountOrArgChange: true },
  )

  useEffect(() => {
    if (result.data) {
      dispatch(setBuildMyCv(result.data as BuildMyCvState))
      // A non-empty resumeId or any personalDetails field indicates an existing record
      const data = result.data as BuildMyCvState
      const exists =
        Boolean(data.resumeId) ||
        Boolean(data.personalDetails?.firstName) ||
        Boolean(data.personalDetails?.lastName) ||
        (data.careerHistory?.length ?? 0) > 0 ||
        (data.skills?.length ?? 0) > 0
      dispatch(setBuildMyCvExists(exists))
      dispatch(setBuildMyCvLastModified(data.lastModified ?? null))
    }
  }, [dispatch, result.data])

  return result
}

export const useSaveBuildMyCv = () => {
  const [trigger, result] = useSaveBuildMyCvMutation()
  return {
    ...result,
    save: async (candidateId: string, payload: SaveBuildMyCvRequest) => {
      try {
        return await trigger({ candidateId, payload }).unwrap()
      } catch (error) {
        throw mapApiError(error)
      }
    },
  }
}

export const useUpdateBuildMyCv = () => {
  const [trigger, result] = useUpdateBuildMyCvMutation()
  return {
    ...result,
    update: async (candidateId: string, payload: UpdateBuildMyCvRequest): Promise<BuildMyCvData> => {
      try {
        return await trigger({ candidateId, payload }).unwrap()
      } catch (error) {
        throw mapApiError(error)
      }
    },
  }
}
