import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { tokenStorage } from '@/app/auth/tokenStorage'
import {
  hasBuildMyCvData,
  useBuildMyCvQuery,
  useCandidateProfileQuery,
} from '@/modules/candidate/hooks/useCandidateQueries'
import { isCandidateProfileCompleteForOnboarding } from '@/modules/candidate/utils/profileCompleteness'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { BuildMyCvState } from '@/types'
import styles from '@/routes/AppRoutes.module.css'

const OnboardingFallback = ({ message }: { message: string }) => (
  <div className={styles.fallbackContainer} role="status">
    <span className={styles.loadingText}>{message}</span>
  </div>
)

export const CandidateOnboardingGuard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const effectiveUser = user ?? tokenStorage.getUser()
  const candidateId = effectiveUser?.candidateId ?? effectiveUser?.userId ?? ''
  // Preserved from the login redirect (e.g. after "candidate already exists" -> login)
  // so onboarding can hand off to the pending job's details page once complete.
  const pendingJobId = new URLSearchParams(location.search).get('job')
  const profileQuery = useCandidateProfileQuery(
    effectiveUser?.candidateId,
    effectiveUser?.userId,
    Boolean(effectiveUser),
  )
  const isProfileComplete = Boolean(
    profileQuery.data &&
      isCandidateProfileCompleteForOnboarding(profileQuery.data),
  )
  const cvQuery = useBuildMyCvQuery(isProfileComplete, candidateId)

  if (profileQuery.isLoading || profileQuery.isFetching) {
    return <OnboardingFallback message="Loading your profile..." />
  }

  if (!isProfileComplete) {
    return (
      <Navigate
        to={{ pathname: ROUTE_PATHS.profileCreation, search: location.search }}
        replace
      />
    )
  }

  if (cvQuery.isLoading || cvQuery.isFetching) {
    return <OnboardingFallback message="Loading your CV..." />
  }

  if (!hasBuildMyCvData(cvQuery.data as BuildMyCvState | undefined)) {
    return (
      <Navigate
        to={{ pathname: ROUTE_PATHS.cvBuilder, search: location.search }}
        replace
      />
    )
  }

  if (pendingJobId) {
    return (
      <Navigate
        to={ROUTE_PATHS.jobDetails.replace(':jobId', pendingJobId)}
        replace
        state={{ autoApply: true }}
      />
    )
  }

  return <Outlet />
}