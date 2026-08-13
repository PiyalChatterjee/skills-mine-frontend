import { Box, Typography } from '@mui/material'

const SavedJobsPage = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1">
        Saved Jobs
      </Typography>
      <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
        Your saved jobs will appear here.
      </Typography>
    </Box>
  )
}

export default SavedJobsPage
