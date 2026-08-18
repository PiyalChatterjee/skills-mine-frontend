import { Box } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { CandidateDetailScreen } from '@/modules/recruiter/components/candidates/CandidateDetailScreen'
import styles from './CandidatesPage.module.css'

const CandidateDetailPage = () => {
  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <CandidateDetailScreen />
    </Box>
  )
}

export default CandidateDetailPage
