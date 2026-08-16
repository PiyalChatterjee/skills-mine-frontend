import { useMemo } from 'react'
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { useJobs } from '@/modules/public/hooks/useJobs'
import { useOptimisticSaveJob } from '@/modules/candidate/hooks/useOptimisticSaveJob'
import bookmarkOutlineIcon from '@/assets/icons/bookmark-outline.svg'
import bookmarkFilledIcon from '@/assets/icons/bookmark-filled.svg'

const JobsPage = () => {
  const { isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob()
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
            const isSaved = isJobSaved(job.jobId)
            const isSaving = isJobSaving(job.jobId)
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
                  startIcon={(
                    <Box
                      component="img"
                      src={isSaved ? bookmarkFilledIcon : bookmarkOutlineIcon}
                      alt=""
                      aria-hidden="true"
                      sx={{ width: 18, height: 18, display: 'block' }}
                    />
                  )}
                  onClick={() => { void toggleJobSaved(job.jobId) }}
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
