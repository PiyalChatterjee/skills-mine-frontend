import { Box } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { CandidatesScreen } from '@/modules/recruiter/components/candidates/CandidatesScreen'
import styles from './CandidatesPage.module.css'

const CandidatesPage = () => {
  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <CandidatesScreen />
    </Box>
  )
}

export default CandidatesPage
