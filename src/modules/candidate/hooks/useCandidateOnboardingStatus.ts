import { useAuth } from '@/app/auth/AuthContext'
import { tokenStorage } from '@/app/auth/tokenStorage'
import {
  hasBuildMyCvData,
  useBuildMyCvQuery,
  useCandidateProfileQuery,
} from '@/modules/candidate/hooks/useCandidateQueries'
import { isCandidateProfileCompleteForOnboarding } from '@/modules/candidate/utils/profileCompleteness'
import type { BuildMyCvState } from '@/types'

export const useCandidateOnboardingStatus = () => {
  const { user } = useAuth()
  const effectiveUser = user ?? tokenStorage.getUser()
  const role = effectiveUser?.role
  // Guests and non-candidate roles are never subject to candidate onboarding.
  const isApplicable = Boolean(effectiveUser) && (!role || role === 'JOB_SEEKER')
  const candidateId = effectiveUser?.candidateId ?? effectiveUser?.userId ?? ''

  const profileQuery = useCandidateProfileQuery(
    effectiveUser?.candidateId,
    effectiveUser?.userId,
    isApplicable,
  )
  const isProfileComplete = Boolean(
    profileQuery.data && isCandidateProfileCompleteForOnboarding(profileQuery.data),
  )
  const cvQuery = useBuildMyCvQuery(isApplicable && isProfileComplete, candidateId)
  const hasCv = hasBuildMyCvData(cvQuery.data as BuildMyCvState | undefined)

  const isProfileLoading = profileQuery.isLoading || profileQuery.isFetching
  const isCvLoading = cvQuery.isLoading || cvQuery.isFetching

  return {
    isApplicable,
    isProfileLoading,
    isProfileComplete,
    isCvLoading,
    hasCv,
    isOnboarding: isApplicable && (!isProfileComplete || !hasCv),
  }
}
