import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import styles from './RecruiterLayout.module.css'

export const RecruiterLayout = () => {

  return (
    <Box className={styles.layoutRoot}>

      <Box component="main" className={styles.contentArea}>
        <Outlet />
      </Box>

    </Box>
  )
}
