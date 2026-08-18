import { useMemo } from 'react'
import { useAuth } from '@/app/auth/AuthContext'
import { useCandidateDashboardQuery } from './useCandidateQueries'

/** Job ids the signed-in candidate has already applied to, sourced from the dashboard applications. */
export const useAppliedJobIds = () => {
  const { user } = useAuth()
  const { data, isLoading } = useCandidateDashboardQuery(Boolean(user))

  const appliedJobIds = useMemo(() => {
    const ids = (data?.applications ?? [])
      .map((application) => application.job?.id)
      .filter((jobId): jobId is string => Boolean(jobId))

    return new Set(ids)
  }, [data])

  return {
    appliedJobIds,
    isAppliedJobIdsLoading: isLoading,
    isJobApplied: (jobId: string) => appliedJobIds.has(jobId),
  }
}
