import { Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { MandatesScreen } from '@/modules/recruiter/components/mandate/MandatesScreen'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './RecruiterMandatesPage.module.css'

const RecruiterMandatesPage = () => {
  const navigate = useNavigate()

  const handleNewJobPost = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost)
  }

  const handleEditJobPost = (mandateId: string) => {
    navigate(ROUTE_PATHS.recruiterEditJobPost.replace(':mandateId', mandateId))
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <MandatesScreen onNewJobPost={handleNewJobPost} onEditJobPost={handleEditJobPost} />
    </Box>
  )
}

export default RecruiterMandatesPage
