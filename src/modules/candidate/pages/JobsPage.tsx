import { useMemo } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useJobs } from '@/modules/public/hooks/useJobs'

const JobsPage = () => {
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
          {jobs.map((job) => (
            <Box
              key={job.jobId}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 2,
                backgroundColor: 'background.paper',
              }}
            >
              <Typography variant="h6">{job.title}</Typography>
              <Typography color="text.secondary">
                {job.company} · {job.location ?? 'Location not specified'}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {job.employmentType} · {job.workType} · {job.salaryRange}
              </Typography>
            </Box>
          ))}
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
