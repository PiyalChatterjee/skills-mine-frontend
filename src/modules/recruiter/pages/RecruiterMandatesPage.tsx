import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { MandatesScreen } from '@/modules/recruiter/components/mandate/MandatesScreen'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './RecruiterMandatesPage.module.css'

const RecruiterMandatesPage = () => {
  const navigate = useNavigate()

  const handleNewMandate = () => {
    navigate(ROUTE_PATHS.recruiterNewMandate)
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <MandatesScreen onNewMandate={handleNewMandate} />
    </Box>
  )
}

export default RecruiterMandatesPage
