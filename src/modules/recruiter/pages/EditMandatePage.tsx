import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, CircularProgress, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { MandateForm } from '@/modules/recruiter/components/mandate/MandateForm'
import { pushNotification } from '@/store/slices/notificationSlice'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { mandateApi } from '@/services/api/mandateApi'
import type { MandateFormValues } from '@/modules/recruiter/components/mandate/types'
import type { JobPost } from '@/types/api'
import styles from './NewMandatePage.module.css'

// ── Map API response → form values ─────────────────────────────────────

const BULLET = '• '

/** Prefix each non-empty line with a bullet so pre-loaded data matches the textarea's format. */
function toBulletLines(value: string | string[] | undefined): string {
  const lines = Array.isArray(value) ? value : (value ?? '').split('\n')
  return lines
    .map(line => (line && !line.startsWith(BULLET) ? BULLET + line : line))
    .join('\n')
}

function toFormValues(post: JobPost): MandateFormValues {
  return {
    companyName:      post.client ?? '',
    positionTitle:    post.title ?? '',
    location:         post.location ?? '',
    fillByDate:       post.targetCloseDate ? post.targetCloseDate.split('T')[0] : '',
    workType:         post.workType ?? '',
    employmentType:   post.employmentType ?? '',
    experienceLevel:  post.experienceLevel ?? '',
    priority:         post.priority
      ? post.priority.charAt(0).toUpperCase() + post.priority.slice(1).toLowerCase()
      : '',
    salaryMin:        typeof post.salaryMin === 'number' ? post.salaryMin : '',
    salaryMax:        typeof post.salaryMax === 'number' ? post.salaryMax : '',
    jobDescription:   post.jobDescription ?? '',
    requirements:     toBulletLines(post.requirements),
    responsibilities: toBulletLines(post.responsibilities),
    benefits:         toBulletLines(post.benefits),
    skills:           post.skills ?? [],
    industries:       post.industries ?? [],
    jobBoards:        post.jobBoards ?? [],
  }
}

// ── Component ──────────────────────────────────────────────────────────

const EditMandatePage = () => {
  const { mandateId } = useParams<{ mandateId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [initialValues, setInitialValues] = useState<MandateFormValues | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // ── Fetch post and convert to form values ────────────────────────────

  useEffect(() => {
    if (!mandateId) return
    mandateApi
      .getJobPostDetail(mandateId)
      .then((envelope) => setInitialValues(toFormValues(envelope.data)))
      .catch(() => setLoadError('Failed to load job post. Please go back and try again.'))
  }, [mandateId])

  // ── Submit handler ───────────────────────────────────────────────────

  const handleSubmit = async (values: MandateFormValues) => {
    try {
      await mandateApi.updateJobPost(mandateId!, {
        companyName:      values.companyName,
        positionTitle:    values.positionTitle,
        location:         values.location,
        fillByDate:       values.fillByDate,
        workType:         values.workType,
        employmentType:   values.employmentType,
        experienceLevel:  values.experienceLevel,
        priority:         values.priority,
        salary: {
          minimum: Number(values.salaryMin),
          maximum: Number(values.salaryMax),
        },
        jobDescription:   values.jobDescription,
        requirements:     values.requirements,
        responsibilities: values.responsibilities,
        benefits:         values.benefits,
        skills:           values.skills,
        industries:       values.industries,
        jobBoards:        values.jobBoards,
      })

      dispatch(pushNotification({
        level: 'success',
        title: 'Mandate updated',
        message: `"${values.positionTitle}" at ${values.companyName} has been updated successfully.`,
      }))

      navigate(ROUTE_PATHS.recruiterJobPosts)
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'Failed to update mandate. Please try again.')
          : 'Failed to update mandate. Please try again.'

      dispatch(pushNotification({ level: 'error', title: 'Update failed', message }))
      throw error // re-throw so MandateForm keeps isSubmitting=false correctly
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>
        {!initialValues && !loadError && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={36} />
          </Box>
        )}

        {loadError && (
          <Typography sx={{ textAlign: 'center', py: 8, color: 'error.main' }}>
            {loadError}
          </Typography>
        )}

        {initialValues && (
          <MandateForm
            title="Edit Job Post"
            submitLabel="Save Changes"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => navigate(ROUTE_PATHS.recruiterJobPosts)}
          />
        )}
      </Box>
    </Box>
  )
}

export default EditMandatePage
