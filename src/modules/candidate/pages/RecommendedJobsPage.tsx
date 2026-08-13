import { Box, Typography } from '@mui/material'

const RecommendedJobsPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1">
        Recommended Jobs
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
        Jobs recommended for you will appear here.
      </Typography>
    </Box>
  )
}

export default RecommendedJobsPage
