import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface ModulePlaceholderProps {
  title: string
  description: string
  actions?: ReactNode
}

export const ModulePlaceholder = ({
  title,
  description,
  actions,
}: ModulePlaceholderProps) => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>
      {actions}
    </Box>
  )
}
