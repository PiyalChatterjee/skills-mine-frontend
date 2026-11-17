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
import { focusFirstErrorField } from '@/app/formValidation'
import { localPhoneNumberSchema } from '@/app/phoneNumber'
import {
  emailSchema,
  requiredField,
} from '@/app/validation.schema'
import styles from '@/modules/recruiter/pages/NewMandatePage.module.css'

// ── Validation schema ──────────────────────────────────────────────────
// Field rules mirror the CV builder / profile forms (shared helpers from
// @/app/validation.schema): values are trimmed, whitespace-only input is
// rejected, text fields must contain a letter, and email / phone use the
// same validators.

const companyNameSchema = requiredField('Company name').refine(
  value => value === '' || /\p{L}/u.test(value),
  'Company name must include at least one letter',
)

const contactPersonSchema = requiredField('Contact person').refine(
  value => value === '' || /^[\p{L}\p{M} ]+$/u.test(value),
  'Contact person can only contain letters and spaces',
)

const positionTitleSchema = requiredField('Position title')
  .refine(
    value => value === '' || /^[\p{L}\p{M}\d ]+$/u.test(value),
    'Position title can only contain letters, numbers and spaces',
  )
  .refine(
    value => value === '' || /\p{L}/u.test(value),
    'Position title must include at least one letter',
  )

const clientRateSchema = requiredField('Client rate').refine(
  value => value === '' || /^\d+(\.\d+)?$/.test(value),
  'Use a valid client rate',
)

const fillByDateSchema = requiredField('Fill by date').refine(
  value =>
    value === '' ||
    (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())),
  'Enter a valid date',
)

/** Bullet textareas are seeded with "• " — a bullet alone is not content. */
const bulletTextField = (requiredMessage: string) =>
  z
    .string()
    .trim()
    .refine(
      value => value.split('\n').some(line => line.replace(/^•\s*/, '').trim() !== ''),
      requiredMessage,
    )

const salarySchema = (requiredMessage: string) =>
  z
    .union([z.number().min(0, 'Must be ≥ 0'), z.literal('')])
    .refine(v => v !== '', { message: requiredMessage })

export const mandateSchema = z
  .object({
    companyName:          companyNameSchema,
    clientRate:           clientRateSchema,
    contactPerson:        contactPersonSchema,
    contactPersonEmail:   emailSchema,
    contactPersonPhone:   localPhoneNumberSchema,
    positionTitle:        positionTitleSchema,
    location:             requiredField('Location'),
    locationId:           z.string(),
    fillByDate:           fillByDateSchema,
    workType:             requiredField('Work type'),
    employmentType:       requiredField('Employment type'),
    experienceLevel:      requiredField('Experience level'),
    priority:             requiredField('Priority'),
    salaryMin:            salarySchema('Minimum salary is required'),
    salaryMax:            salarySchema('Maximum salary is required'),
    isSalaryHidden:       z.boolean(),
    jobDescription:       requiredField('Job description'),
    requirements:         bulletTextField('Requirements are required'),
    responsibilities:     bulletTextField('Responsibilities are required'),
    benefits:             bulletTextField('Benefits are required'),
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
  locationId: '',
  fillByDate: '',
  workType: '',
  employmentType: '',
  experienceLevel: '',
  priority: '',
  salaryMin: '',
  salaryMax: '',
  isSalaryHidden: false,
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
  /** Called when the user cancels — navigate away from the form */
  onCancel?: () => void
}

// ── Component ──────────────────────────────────────────────────────────

export const MandateForm = ({
  title,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel = () => {},
}: MandateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    formState: {  isValid },
  } = useForm<MandateFormValues>({
    resolver: zodResolver(mandateSchema),
    defaultValues: initialValues,
    // Validate on blur (as the CV builder does); reValidateMode clears errors
    // immediately once a field is fixed.
    mode: 'onBlur',
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

  return (
    <>
      {/* ── Header ── */}
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          {title}
        </Typography>
      </Box>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(handleFormSubmit, errors => { focusFirstErrorField(errors) })} noValidate>
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

        <StickyFooter isSubmitting={isSubmitting} submitLabel={submitLabel} isValid={isValid} />
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
