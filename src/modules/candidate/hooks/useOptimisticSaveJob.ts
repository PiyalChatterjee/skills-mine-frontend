import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@/app/auth/AuthContext'
import { selectSavedJobIds } from '@/store/selectors'
import { addSavedJob, removeSavedJob } from '@/store/slices/candidateSlice'
import type { AppDispatch } from '@/store'
import { useCandidateResourceId } from './useCandidateQueries'
import { useSaveJobMutation, useRemoveSavedJobMutation } from '@/store/api/apiSlice'

export const useOptimisticSaveJob = () => {
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const savedJobIds = useSelector(selectSavedJobIds)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  const candidateId = useCandidateResourceId()

  const [saveJob] = useSaveJobMutation()
  const [removeSavedJobMutation] = useRemoveSavedJobMutation()

  const isJobSaved = useCallback((jobId: string) => savedJobIds.has(jobId), [savedJobIds])
  const isJobSaving = useCallback((jobId: string) => savingIds.has(jobId), [savingIds])

  const toggleJobSaved = useCallback(async (jobId: string) => {
    if (savingIds.has(jobId)) return
    if (!user?.userId) return

    const isCurrentlySaved = savedJobIds.has(jobId)
    if (isCurrentlySaved) {
      dispatch(removeSavedJob(jobId))
    } else {
      dispatch(addSavedJob(jobId))
    }

    setSavingIds((prev) => new Set(prev).add(jobId))

    try {
      if (!candidateId) {
        throw new Error('Candidate identity is unavailable')
      }

      if (!isCurrentlySaved) {
        await saveJob({ candidateId, jobProfileId: jobId }).unwrap()
      } else {
        await removeSavedJobMutation({ candidateId, jobProfileId: jobId }).unwrap()
      }
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
  }, [candidateId, dispatch, savedJobIds, savingIds, user])

  return {
    savedJobIds,
    isJobSaved,
    isJobSaving,
    toggleJobSaved,
  }
}
