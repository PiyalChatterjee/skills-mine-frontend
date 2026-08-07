import { useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { useJobs } from '@/modules/public/hooks/useJobs'
import { useAuth } from '@/app/auth/AuthContext'
import { useUserProfile, useSaveJob } from '@/modules/candidate/hooks/useCandidateQueries'
import { selectSavedJobIds } from '@/store/selectors'
import { addSavedJob, removeSavedJob } from '@/store/slices/candidateSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'
import type { Job } from '@/types'

const BookmarkOutlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const BookmarkFilledIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />
  </svg>
)

const JobsPage = () => {
  const { user } = useAuth()
  const dispatch = useDispatch<AppDispatch>()
  const savedJobIds = useSelector(selectSavedJobIds)
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  // Hydrate saved jobs into Redux from user profile
  useUserProfile(user?.userId)
  const [saveJobTrigger] = useSaveJob()

  const handleSave = async (job: Job) => {
    if (savingIds.has(job.jobId)) return
    const isCurrentlySaved = savedJobIds.has(job.jobId)

    // Optimistic update
    if (isCurrentlySaved) {
      dispatch(removeSavedJob(job.jobId))
    } else {
      dispatch(addSavedJob({
        jobId: job.jobId,
        title: job.title,
        company: job.company,
        location: job.location,
        industry: job.industry,
        salaryRange: job.salaryRange,
        workType: job.workType,
        employmentType: job.employmentType,
      }))
    }

    setSavingIds((prev) => new Set(prev).add(job.jobId))
    try {
      await saveJobTrigger(job.jobId).unwrap()
    } catch {
      // Roll back optimistic update on failure
      if (isCurrentlySaved) {
        dispatch(addSavedJob({
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          industry: job.industry,
          salaryRange: job.salaryRange,
          workType: job.workType,
          employmentType: job.employmentType,
        }))
      } else {
        dispatch(removeSavedJob(job.jobId))
      }
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(job.jobId)
        return next
      })
    }
  }
  const {
    data,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
  } = useJobs(undefined, true)

  const jobs = useMemo(() => {
    const pages = data?.pages ?? []
    return pages.flatMap((page) => page.jobs)
  }, [data])

  const errorMessage =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message ?? 'Failed to load jobs.')
      : 'Failed to load jobs.'

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1080, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        Jobs
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse and track open opportunities.
      </Typography>

      {isError ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}

      {jobs.length === 0 ? (
        <Typography color="text.secondary">No jobs available right now.</Typography>
      ) : (
        <Stack spacing={2}>
          {jobs.map((job) => {
            const isSaved = savedJobIds.has(job.jobId)
            const isSaving = savingIds.has(job.jobId)
            return (
              <Box
                key={job.jobId}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography color="text.secondary">
                    {job.company} · {job.location ?? 'Location not specified'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {job.employmentType} · {job.workType} · {job.salaryRange}
                  </Typography>
                  {job.skills && job.skills.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                      {job.skills.map((skill) => (
                        <Chip key={skill} label={skill} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}
                </Box>
                <Button
                  size="small"
                  variant={isSaved ? 'contained' : 'outlined'}
                  disabled={isSaving}
                  startIcon={isSaved ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
                  onClick={() => { void handleSave(job) }}
                  aria-label={isSaved ? `Unsave ${job.title}` : `Save ${job.title}`}
                >
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </Button>
              </Box>
            )
          })}
        </Stack>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => {
            void fetchNextPage()
          }}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading more...' : hasNextPage ? 'Load more jobs' : 'No more jobs'}
        </Button>
      </Box>
    </Box>
  )
}

export default JobsPage
