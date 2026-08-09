import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  useGetCandidateDashboardQuery,
  useGetCandidateProfileQuery,
  useGetUserProfileQuery,
  useSaveJobMutation,
  useSearchSkillsQuery,
  useGetBuildMyCvQuery,
  useSaveBuildMyCvMutation,
  useUpdateBuildMyCvMutation,
  useUpdateCandidateProfileMutation as useUpdateCandidateProfileRtkMutation,
} from '@/store/api/apiSlice'
import { setSavedJobs, setAvailableSkills, setBuildMyCv, setBuildMyCvExists } from '@/store/slices/candidateSlice'
import type { CandidateProfileUpdatePayload } from '@/modules/candidate/types'
import type { ApiError, BuildMyCvData, BuildMyCvState, SaveBuildMyCvRequest, UpdateBuildMyCvRequest } from '@/types'
import type { AppDispatch } from '@/store'

export const useCandidateProfileQuery = (
  userId?: string,
  enabled = true,
) => {
  return useGetCandidateProfileQuery(userId as string, {
    skip: !enabled || !userId,
  })
}

export const useCandidateDashboardQuery = (userId?: string, enabled = true) =>
  useGetCandidateDashboardQuery(userId as string, { skip: !enabled || !userId })

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

// Fetches UserProfile (savedJobs) and hydrates Redux candidate slice
export const useUserProfile = (userId?: string) => {
  const dispatch = useDispatch<AppDispatch>()
  const result = useGetUserProfileQuery(userId as string, { skip: !userId })

  useEffect(() => {
    if (result.data) {
      dispatch(setSavedJobs(result.data.savedJobs))
    }
  }, [dispatch, result.data])

  return result
}

export const useSaveJob = () => useSaveJobMutation()

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
export const useBuildMyCvQuery = (enabled = true) => {
  const dispatch = useDispatch<AppDispatch>()
  const result = useGetBuildMyCvQuery(undefined, { skip: !enabled })

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
    }
  }, [dispatch, result.data])

  return result
}

export const useSaveBuildMyCv = () => {
  const [trigger, result] = useSaveBuildMyCvMutation()
  return {
    ...result,
    save: async (payload: SaveBuildMyCvRequest) => {
      try {
        return await trigger(payload).unwrap()
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
    update: async (payload: UpdateBuildMyCvRequest): Promise<BuildMyCvData> => {
      try {
        return await trigger(payload).unwrap()
      } catch (error) {
        throw mapApiError(error)
      }
    },
  }
}
