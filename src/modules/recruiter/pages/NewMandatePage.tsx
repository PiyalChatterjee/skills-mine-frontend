import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { MandateForm, emptyMandateValues } from '@/modules/recruiter/components/mandate/MandateForm'
import { pushNotification } from '@/store/slices/notificationSlice'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { mandateApi } from '@/services/api/mandateApi'
import type { MandateFormValues } from '@/modules/recruiter/components/mandate/types'
import styles from './NewMandatePage.module.css'

const NewMandatePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleSubmit = async (values: MandateFormValues) => {
    await mandateApi.createJobPost({
      companyName: values.companyName,
      clientRate: values.clientRate,
      contactName: values.contactPerson,
      contactEmail: values.contactPersonEmail,
      contactPhoneNumber: values.contactPersonPhone,
      positionTitle: values.positionTitle,
      location: values.location,
      fillByDate: values.fillByDate,
      workType: values.workType,
      employmentType: values.employmentType,
      experienceLevel: values.experienceLevel,
      priority: values.priority,
      salary: {
        minimum: Number(values.salaryMin),
        maximum: Number(values.salaryMax),
      },
      jobDescription: values.jobDescription,
      requirements: values.requirements,
      responsibilities: values.responsibilities,
      benefits: values.benefits,
      skills: values.skills,
      industries: values.industries,
      jobBoards: values.jobBoards,
    })

    dispatch(pushNotification({
      level: 'success',
      title: 'Mandate posted',
      message: `"${values.positionTitle}" at ${values.companyName} has been posted successfully.`,
    }))

    navigate(ROUTE_PATHS.recruiterDashboard)
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />
      <Box className={styles.pageRoot}>
        <MandateForm
          title="New Job Post"
          submitLabel="Post Mandate"
          initialValues={emptyMandateValues}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTE_PATHS.recruiterDashboard)}
        />
      </Box>
    </Box>
  )
}

export default NewMandatePage
