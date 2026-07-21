import { Box, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'

export const MancoLayout = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Box component="header" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">MANCO Portal</Typography>
      </Box>
      <Box component="main">
        <Outlet />
      </Box>
    </div>
  )
}
