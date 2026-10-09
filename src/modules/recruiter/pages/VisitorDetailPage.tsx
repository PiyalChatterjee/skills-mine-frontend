import { Box } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { VisitorDetailScreen } from '@/modules/recruiter/components/candidates/VisitorDetailScreen'
import styles from './CandidatesPage.module.css'

const VisitorDetailPage = () => {
  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <VisitorDetailScreen />
    </Box>
  )
}

export default VisitorDetailPage
