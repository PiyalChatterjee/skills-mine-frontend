import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useCandidateOnboardingStatus } from '@/modules/candidate/hooks/useCandidateOnboardingStatus'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from '@/routes/AppRoutes.module.css'

const OnboardingFallback = ({ message }: { message: string }) => (
  <div className={styles.fallbackContainer} role="status">
    <span className={styles.loadingText}>{message}</span>
  </div>
)

type CandidateOnboardingGuardProps = {
  // CV builder only needs a completed profile; every other candidate page also needs a CV.
  requireCv?: boolean
}

export const CandidateOnboardingGuard = ({
  requireCv = true,
}: CandidateOnboardingGuardProps) => {
  const location = useLocation()
  // Preserved from the login redirect (e.g. after "candidate already exists" -> login)
  // so onboarding can hand off to the pending job's details page once complete.
  const pendingJobId = new URLSearchParams(location.search).get('job')
  const { isApplicable, isProfileLoading, isProfileComplete, isCvLoading, hasCv } =
    useCandidateOnboardingStatus()

  if (!isApplicable) {
    return <Outlet />
  }

  if (isProfileLoading) {
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

  if (!requireCv) {
    return <Outlet />
  }

  if (isCvLoading) {
    return <OnboardingFallback message="Loading your CV..." />
  }

  if (!hasCv) {
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