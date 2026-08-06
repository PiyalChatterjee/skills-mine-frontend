import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { BasicInformationSection } from '@/modules/recruiter/components/mandate/BasicInformationSection'
import { SalarySection } from '@/modules/recruiter/components/mandate/SalarySection'
import { JobDescriptionSection } from '@/modules/recruiter/components/mandate/JobDescriptionSection'
import { BulletTextareaSection } from '@/modules/recruiter/components/mandate/BulletTextareaSection'
import { SkillsInput } from '@/modules/recruiter/components/mandate/SkillsInput'
import { IndustriesInput } from '@/modules/recruiter/components/mandate/IndustriesInput'
import { JobBoardSelector } from '@/modules/recruiter/components/mandate/JobBoardSelector'
import { StickyFooter } from '@/modules/recruiter/components/mandate/StickyFooter'
import { pushNotification } from '@/store/slices/notificationSlice'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { mandateApi } from '@/services/api/mandateApi'
import type { MandateFormValues } from '@/modules/recruiter/components/mandate/types'
import styles from './NewMandatePage.module.css'

// ── Validation schema ──────────────────────────────────────────────────

const schema = z
  .object({
    companyName:     z.string().min(1, 'Company name is required'),
    positionTitle:   z.string().min(1, 'Position title is required'),
    location:        z.string(),
    fillByDate:      z.string().min(1, 'Fill by date is required'),
    workType:        z.string().min(1, 'Work type is required'),
    employmentType:  z.string().min(1, 'Employment type is required'),
    experienceLevel: z.string().min(1, 'Experience level is required'),
    priority:        z.string().min(1, 'Priority is required'),
    salaryMin:       z.union([z.number().min(0, 'Must be ≥ 0'), z.literal('')]).refine(v => v !== '', { message: 'Minimum salary is required' }),
    salaryMax:       z.union([z.number().min(0, 'Must be ≥ 0'), z.literal('')]).refine(v => v !== '', { message: 'Maximum salary is required' }),
    jobDescription:  z.string().min(1, 'Job description is required'),
    requirements:    z.string().min(1, 'Requirements are required'),
    responsibilities:z.string().min(1, 'Responsibilities are required'),
    benefits:        z.string().min(1, 'Benefits are required'),
    skills:          z.array(z.string()).min(1, 'At least one skill is required'),
    industries:      z.array(z.string()).min(1, 'At least one industry is required'),
    jobBoards:       z.array(z.string()).min(1, 'Select at least one job board'),
  })
  .refine(
    data => {
      if (typeof data.salaryMin !== 'number' || typeof data.salaryMax !== 'number') {
        return true
      }

      return data.salaryMin <= data.salaryMax
    },
    { message: 'Minimum salary cannot exceed maximum', path: ['salaryMin'] },
  )

// ── Default values ─────────────────────────────────────────────────────

const defaultValues: MandateFormValues = {
  companyName: '',
  positionTitle: '',
  location: '',
  fillByDate: '',
  workType: '',
  employmentType: '',
  experienceLevel: '',
  priority: '',
  salaryMin: '',
  salaryMax: '',
  jobDescription: '',
  requirements: '',
  responsibilities: '',
  benefits: '',
  skills: [],
  industries: [],
  jobBoards: [],
}

// ── Component ──────────────────────────────────────────────────────────

const NewMandatePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<MandateFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
  })

  // ── Submit ──────────────────────────────────────────────────────────

  const onSubmit = async (values: MandateFormValues) => {
    setIsSubmitting(true)
    try {
      await mandateApi.createMandate({
        companyName: values.companyName,
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

      navigate(ROUTE_PATHS.recruiter)
    } catch (error) {
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? 'Failed to post mandate. Please try again.')
          : 'Failed to post mandate. Please try again.'

      dispatch(pushNotification({
        level: 'error',
        title: 'Mandate post failed',
        message,
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Cancel ──────────────────────────────────────────────────────────

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelDialog(true)
    } else {
      navigate(ROUTE_PATHS.recruiter)
    }
  }

  const confirmCancel = () => {
    setShowCancelDialog(false)
    navigate(ROUTE_PATHS.recruiter)
  }

  // ── Back icon ────────────────────────────────────────────────────────

  const BackArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>

        {/* ── Header ── */}
        <Box className={styles.pageHeader}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleCancel}
          >
            <BackArrowIcon /> Back
          </button>
          <Typography component="h1" className={styles.pageTitle}>
            New Mandate
          </Typography>
        </Box>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box className={styles.card}>
            <BasicInformationSection control={control} errors={errors} />
            <SalarySection control={control} errors={errors} />
            <JobDescriptionSection control={control} errors={errors} />
            <BulletTextareaSection
              control={control}
              errors={errors}
              name="requirements"
              label="Requirements"
              placeholder={"Bachelor's degree...\n2 years experience...\nKnowledge of..."}
            />
            <BulletTextareaSection
              control={control}
              errors={errors}
              name="responsibilities"
              label="Responsibilities"
              placeholder="Oversee user research..."
            />
            <BulletTextareaSection
              control={control}
              errors={errors}
              name="benefits"
              label="Benefits"
              placeholder="Generous annual leave..."
            />
            <SkillsInput control={control} errors={errors} />
            <IndustriesInput control={control} errors={errors} />
            <JobBoardSelector control={control} errors={errors} />
          </Box>

          <StickyFooter onCancel={handleCancel} isSubmitting={isSubmitting} />
        </form>

      </Box>

      {/* ── Cancel confirmation dialog ── */}
      {showCancelDialog && (
        <Box className={styles.dialogBackdrop} onClick={() => setShowCancelDialog(false)}>
          <Box className={styles.dialog} onClick={e => e.stopPropagation()}>
            <Typography component="h3" className={styles.dialogTitle}>Discard changes?</Typography>
            <Typography component="p" className={styles.dialogBody}>
              You have unsaved changes. Are you sure you want to leave?
            </Typography>
            <Box className={styles.dialogBtns}>
              <button type="button" className={styles.dialogCancelBtn} onClick={() => setShowCancelDialog(false)}>
                Keep editing
              </button>
              <button type="button" className={styles.dialogDiscardBtn} onClick={confirmCancel}>
                Discard
              </button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default NewMandatePage
