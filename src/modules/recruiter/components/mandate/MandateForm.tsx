import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Box, Typography } from '@mui/material'
import { BasicInformationSection } from './BasicInformationSection'
import { SalarySection } from './SalarySection'
import { JobDescriptionSection } from './JobDescriptionSection'
import { BulletTextareaSection } from './BulletTextareaSection'
import { SkillsInput, MAX_SKILL_LENGTH } from './SkillsInput'
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
    clientId:             z.string().optional(),
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
    skills:               z
      .array(z.string().max(MAX_SKILL_LENGTH, `Each skill must not exceed ${MAX_SKILL_LENGTH} characters`))
      .min(1, 'At least one skill is required'),
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
  /**
   * Edit flow: ask for confirmation the first time the user modifies the company name.
   * "Yes" lets the change through, "No" keeps the original company data.
   */
  confirmCompanyChange?: boolean
}

// ── Component ──────────────────────────────────────────────────────────

export const MandateForm = ({
  title,
  submitLabel,
  initialValues,
  onSubmit,
  onCancel = () => {},
  confirmCompanyChange = false,
}: MandateFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [pendingCompanyChange, setPendingCompanyChange] = useState<(() => void) | null>(null)
  const companyChangeConfirmedRef = useRef(false)

  const {
    control,
    handleSubmit,
    setValue,
  } = useForm<MandateFormValues>({
    resolver: zodResolver(mandateSchema),
    defaultValues: initialValues,
    // Validate on blur (as the CV builder does); reValidateMode clears errors
    // immediately once a field is fixed.
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  // formState.isValid only refreshes on blur in onBlur mode, and the chip
  // inputs (skills / industries) never blur the form field — so derive
  // validity from the live values instead.
  const values = useWatch({ control }) as MandateFormValues
  const isValid = mandateSchema.safeParse(values).success

  /** Gate for company-name edits: `apply` is held until the user confirms in the dialog. */
  const requestCompanyChange = confirmCompanyChange
    ? (apply: () => void) => {
        if (companyChangeConfirmedRef.current) {
          apply()
          return
        }
        setPendingCompanyChange(() => apply)
      }
    : undefined

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
          <BasicInformationSection
            control={control}
            setValue={setValue}
            requestCompanyChange={requestCompanyChange}
          />
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

      {/* ── Company change confirmation dialog ── */}
      {pendingCompanyChange && (
        <Box className={styles.dialogBackdrop} onClick={() => setPendingCompanyChange(null)}>
          <Box className={styles.dialog} onClick={e => e.stopPropagation()}>
            <Typography component="h3" className={styles.dialogTitle}>Change company name?</Typography>
            <Typography component="p" className={styles.dialogBody}>
              You are changing the company name from "{initialValues.companyName}". Do you want to continue?
              Choosing "No" keeps the original company details.
            </Typography>
            <Box className={styles.dialogBtns}>
              <button type="button" className={styles.dialogCancelBtn} onClick={() => setPendingCompanyChange(null)}>
                No
              </button>
              <button
                type="button"
                className={styles.dialogDiscardBtn}
                onClick={() => {
                  companyChangeConfirmedRef.current = true
                  pendingCompanyChange()
                  setPendingCompanyChange(null)
                }}
              >
                Yes, change
              </button>
            </Box>
          </Box>
        </Box>
      )}

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
