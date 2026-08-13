import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@/app/auth/AuthContext'
import { selectSavedJobIds } from '@/store/selectors'
import { addSavedJob, removeSavedJob } from '@/store/slices/candidateSlice'
import type { AppDispatch } from '@/store'
import { useSaveJob, useUserProfile } from './useCandidateQueries'

const toNextSavedJobs = (savedJobIds: Set<string>, jobId: string, isCurrentlySaved: boolean) => {
  if (isCurrentlySaved) {
    return Array.from(savedJobIds).filter((savedId) => savedId !== jobId)
  }

  return Array.from(new Set([...savedJobIds, jobId]))
}

export const useOptimisticSaveJob = () => {
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const savedJobIds = useSelector(selectSavedJobIds)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  useUserProfile(user?.userId)
  const [saveJobTrigger] = useSaveJob()

  const isJobSaved = useCallback((jobId: string) => savedJobIds.has(jobId), [savedJobIds])
  const isJobSaving = useCallback((jobId: string) => savingIds.has(jobId), [savingIds])

  const toggleJobSaved = useCallback(async (jobId: string) => {
    if (savingIds.has(jobId)) return
    if (!user?.userId) return

    const isCurrentlySaved = savedJobIds.has(jobId)
    const nextSavedJobs = toNextSavedJobs(savedJobIds, jobId, isCurrentlySaved)

    if (isCurrentlySaved) {
      dispatch(removeSavedJob(jobId))
    } else {
      dispatch(addSavedJob(jobId))
    }

    setSavingIds((prev) => new Set(prev).add(jobId))

    try {
      await saveJobTrigger({
        userId: user.userId,
        savedJobs: nextSavedJobs,
      }).unwrap()
    } catch {
      if (isCurrentlySaved) {
        dispatch(addSavedJob(jobId))
      } else {
        dispatch(removeSavedJob(jobId))
      }
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(jobId)
        return next
      })
    }
  }, [dispatch, saveJobTrigger, savedJobIds, savingIds, user?.userId])

  return {
    savedJobIds,
    isJobSaved,
    isJobSaving,
    toggleJobSaved,
  }
}
