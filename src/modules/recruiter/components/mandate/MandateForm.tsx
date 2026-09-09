import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Typography } from '@mui/material'
import { BasicInformationSection } from './BasicInformationSection'
import { SalarySection } from './SalarySection'
import { JobDescriptionSection } from './JobDescriptionSection'
import { BulletTextareaSection } from './BulletTextareaSection'
import { SkillsInput } from './SkillsInput'
import { IndustriesInput } from './IndustriesInput'
import { StickyFooter } from './StickyFooter'
import type { MandateFormValues } from './types'
import styles from '@/modules/recruiter/pages/NewMandatePage.module.css'

// ── Validation schema ──────────────────────────────────────────────────

export const mandateSchema = z
  .object({
    companyName:          z.string().min(1, 'Company name is required'),
    clientRate:           z.string().min(1, 'Client rate is required'),
    contactPerson:        z.string().min(1, 'Contact person is required'),
    contactPersonEmail:   z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    contactPersonPhone:   z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    positionTitle:        z.string().min(1, 'Position title is required'),
    location:             z.string().min(1, 'Location is required'),
    fillByDate:           z.string().min(1, 'Fill by date is required'),
    workType:             z.string().min(1, 'Work type is required'),
    employmentType:       z.string().min(1, 'Employment type is required'),
    experienceLevel:      z.string().min(1, 'Experience level is required'),
    priority:             z.string().min(1, 'Priority is required'),
    salaryMin:            z.union([z.number().min(0, 'Must be ≥ 0'), z.literal('')]).refine(v => v !== '', { message: 'Minimum salary is required' }),
    salaryMax:            z.union([z.number().min(0, 'Must be ≥ 0'), z.literal('')]).refine(v => v !== '', { message: 'Maximum salary is required' }),
    jobDescription:       z.string().min(1, 'Job description is required'),
    requirements:         z.string().min(1, 'Requirements are required'),
    responsibilities:     z.string().min(1, 'Responsibilities are required'),
    benefits:             z.string().min(1, 'Benefits are required'),
    skills:               z.array(z.string()).min(1, 'At least one skill is required'),
    industries:           z.array(z.string()).min(1, 'At least one industry is required').max(1, 'Only one industry may be added'),
    jobBoards:            z.array(z.string()),
  })
  .refine(
    data => {
      if (typeof data.salaryMin !== 'number' || typeof data.salaryMax !== 'number') return true
      return data.salaryMin <= data.salaryMax
    },
    { message: 'Minimum salary cannot exceed maximum', path: ['salaryMin'] },
  )

// ── Empty defaults ─────────────────────────────────────────────────────

export const emptyMandateValues: MandateFormValues = {
  companyName: '',
  clientRate: '',
  contactPerson: '',
  contactPersonEmail: '',
  contactPersonPhone: '',
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

// ── Props ──────────────────────────────────────────────────────────────

interface MandateFormProps {
  /** Page heading shown above the form card */
  title: string
  /** Label for the submit button, e.g. "Post Mandate" or "Save Changes" */
  submitLabel: string
  /** Pre-filled values — pass emptyMandateValues for the create flow */
  initialValues: MandateFormValues
  /** Called with validated form values when the user submits */
  onSubmit: (values: MandateFormValues) => Promise<void>
  /** Called when the user clicks Back / Cancel without unsaved changes */
  onCancel: () => void
}

// ── Component ──────────────────────────────────────────────────────────

export const MandateForm = ({
  title,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel,
}: MandateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useForm<MandateFormValues>({
    resolver: zodResolver(mandateSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const handleFormSubmit = async (values: MandateFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      setShowCancelDialog(true)
    } else {
      onCancel()
    }
  }

  return (
    <>
      {/* ── Header ── */}
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          {title}
        </Typography>
      </Box>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Box className={styles.card}>
          <BasicInformationSection control={control} setValue={setValue} />
          <SalarySection control={control} />
          <JobDescriptionSection control={control} />
          <BulletTextareaSection
            control={control}
            name="requirements"
            label="Requirements *"
            placeholder={"Bachelor's degree...\n2 years experience...\nKnowledge of..."}
          />
          <BulletTextareaSection
            control={control}
            name="responsibilities"
            label="Responsibilities *"
            placeholder="Oversee user research..."
          />
          <BulletTextareaSection
            control={control}
            name="benefits"
            label="Benefits *"
            placeholder="Generous annual leave..."
          />
          <SkillsInput control={control} />
          <IndustriesInput control={control} />
        </Box>

        <StickyFooter onCancel={handleCancel} isSubmitting={isSubmitting} submitLabel={submitLabel} />
      </form>

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
              <button type="button" className={styles.dialogDiscardBtn} onClick={() => { setShowCancelDialog(false); onCancel() }}>
                Discard
              </button>
            </Box>
          </Box>
        </Box>
      )}
    </>
  )
}
