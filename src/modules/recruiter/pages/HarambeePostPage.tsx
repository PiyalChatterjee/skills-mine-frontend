import { useEffect, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { StickyFooter } from '@/modules/recruiter/components/mandate/StickyFooter'
import {
  externalJobsApi,
  HARAMBEE_CONTRACT_TYPES,
  HARAMBEE_ROLES,
  type HarambeeContractType,
  type HarambeePrefillResponse,
  type HarambeePublishRecord,
  type HarambeePublishesParams,
  type HarambeeRole,
  type PublishHarambeeJobRequest,
} from '@/services/api/externalJobsApi'
import { extractErrorMessage } from '@/app/errorUtils'
import { pushNotification } from '@/store/slices/notificationSlice'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import pageStyles from './NewMandatePage.module.css'
import formStyles from '@/modules/recruiter/components/mandate/form.module.css'
import styles from './HarambeePostPage.module.css'

type HarambeeFormValues = {
  jobTitle: string
  jobDescription: string
  addressName: string
  addressLine1: string
  suburbName: string
  cityName: string
  postalCode: string
  province: string
  employmentStartDate: string
  closingDate: string
  duration: string
  contractType: string
  salary: string
  applicationUrl: string
  referenceNumber: string
  archetypalRole: string
}

const initialValues: HarambeeFormValues = {
  jobTitle: '',
  jobDescription: '',
  addressName: '',
  addressLine1: '',
  suburbName: '',
  cityName: '',
  postalCode: '',
  province: '',
  employmentStartDate: '',
  closingDate: '',
  duration: '',
  contractType: '',
  salary: '',
  applicationUrl: '',
  referenceNumber: '',
  archetypalRole: '',
}

// Schema pattern for free-text fields: must not contain http, www, < or >.
const FREE_TEXT_PATTERN = /^(?!.*http|.*www|.*<|.*>).*$/s
const ADDRESS_NAME_PATTERN = /^[A-Za-z0-9_ ]*$/
const POSTAL_CODE_PATTERN = /^[0-9]{1,4}$/

// Overlays the Harambee prefill on the form values. Only non-empty values are
// applied. Fields listed in missing_fields are skipped even if a placeholder value
// came back (e.g. archetypal_role "Other"), so the recruiter has to choose them.
const applyPrefill = (
  base: HarambeeFormValues,
  { prefill, missing_fields: missingFields }: HarambeePrefillResponse,
  jobProfileId: string,
): HarambeeFormValues => {
  const address = prefill.address ?? {}
  const isMissing = (field: string) => missingFields.includes(field)
  const pick = (value: string | null | undefined, fallback: string, field?: string) =>
    field && isMissing(field) ? fallback : value || fallback
  return {
    ...base,
    jobTitle: pick(prefill.job_title, base.jobTitle),
    jobDescription: pick(prefill.job_description, base.jobDescription),
    addressName: pick(address.address_name, base.addressName, 'address.address_name'),
    addressLine1: pick(address.address_line_1, base.addressLine1, 'address.address_line_1'),
    suburbName: pick(address.suburb_name, base.suburbName, 'address.suburb_name'),
    cityName: pick(address.city_name, base.cityName, 'address.city_name'),
    postalCode: pick(address.postal_code, base.postalCode, 'address.postal_code'),
    province: pick(address.province, base.province, 'address.province'),
    employmentStartDate: pick(prefill.employment_start_date?.slice(0, 10), base.employmentStartDate, 'employment_start_date'),
    closingDate: pick(prefill.closing_date?.slice(0, 10), base.closingDate, 'closing_date'),
    duration: pick(prefill.duration, base.duration, 'duration'),
    contractType: pick(prefill.contract_type, base.contractType, 'contract_type'),
    salary: pick(prefill.salary, base.salary, 'salary'),
    // Portal URL where work-seekers apply; used when the prefill doesn't supply one.
    applicationUrl: pick(
      prefill.application_url,
      `${window.location.origin}${ROUTE_PATHS.jobDetails.replace(':jobId', jobProfileId)}`,
    ),
    referenceNumber: pick(prefill.reference_number, base.referenceNumber),
    archetypalRole: pick(prefill.archetypal_role, base.archetypalRole, 'archetypal_role'),
  }
}

const applyPublishRecord = (base: HarambeeFormValues, record: HarambeePublishRecord): HarambeeFormValues => ({
  ...base,
  jobTitle: record.job_title ?? base.jobTitle,
  jobDescription: record.job_description ?? base.jobDescription,
  addressName: record.address?.address_name ?? base.addressName,
  addressLine1: record.address?.address_line_1 ?? base.addressLine1,
  suburbName: record.address?.suburb_name ?? base.suburbName,
  cityName: record.address?.city_name ?? base.cityName,
  postalCode: record.address?.postal_code ?? base.postalCode,
  province: record.address?.province ?? base.province,
  employmentStartDate: record.employment_start_date?.slice(0, 10) ?? base.employmentStartDate,
  closingDate: record.closing_date?.slice(0, 10) ?? base.closingDate,
  duration: record.duration ?? base.duration,
  contractType: record.contract_type ?? base.contractType,
  salary: record.salary ?? base.salary,
  applicationUrl: record.application_url ?? base.applicationUrl,
  referenceNumber: record.reference_number ?? base.referenceNumber,
  archetypalRole: record.archetypal_role ?? base.archetypalRole,
})

const todayIso = () => new Date().toISOString().slice(0, 10)

type LengthRule = { required: boolean; min: number; max?: number; pattern?: RegExp; patternMessage?: string }

const checkText = (value: string, { required, min, max, pattern, patternMessage }: LengthRule): string => {
  if (!value.trim()) return required ? 'This field is required' : ''
  if (value.length < min) return `Must be at least ${min} characters`
  if (max != null && value.length > max) return `Must be at most ${max} characters`
  if (pattern && !pattern.test(value)) return patternMessage ?? 'Must not contain http, www, < or >'
  return ''
}

const validate = (values: HarambeeFormValues): Partial<Record<keyof HarambeeFormValues, string>> => {
  const freeText = (value: string, min: number, max: number, required = true) =>
    checkText(value, { required, min, max, pattern: FREE_TEXT_PATTERN })

  const errors: Partial<Record<keyof HarambeeFormValues, string>> = {
    jobTitle: freeText(values.jobTitle, 2, 200),
    jobDescription: values.jobDescription.trim() ? '' : 'This field is required',
    addressName: checkText(values.addressName, {
      required: true,
      min: 2,
      max: 100,
      pattern: ADDRESS_NAME_PATTERN,
      patternMessage: 'Letters, digits, underscores and spaces only',
    }),
    addressLine1: freeText(values.addressLine1, 2, 500),
    suburbName: freeText(values.suburbName, 2, 100),
    cityName: freeText(values.cityName, 2, 100),
    postalCode: checkText(values.postalCode, {
      required: true,
      min: 2,
      max: 4,
      pattern: POSTAL_CODE_PATTERN,
      patternMessage: 'Digits only',
    }),
    province: freeText(values.province, 2, 50),
    duration: freeText(values.duration, 1, 200),
    salary: freeText(values.salary, 1, 200),
    referenceNumber: freeText(values.referenceNumber, 0, 250, false),
    contractType: values.contractType ? '' : 'This field is required',
    archetypalRole: values.archetypalRole ? '' : 'This field is required',
  }

  if (!values.closingDate) errors.closingDate = 'This field is required'
  else if (values.closingDate <= todayIso()) errors.closingDate = 'Must be in the future'

  if (!values.employmentStartDate) errors.employmentStartDate = 'This field is required'
  else if (values.closingDate && values.employmentStartDate <= values.closingDate) {
    errors.employmentStartDate = 'Must be after the closing date'
  }

  try {
    if (!values.applicationUrl.trim()) errors.applicationUrl = 'This field is required'
    else new URL(values.applicationUrl)
  } catch {
    errors.applicationUrl = 'Must be a valid URL'
  }

  return errors
}

const buildPublishRequest = (values: HarambeeFormValues, jobProfileId: string): PublishHarambeeJobRequest => ({
  job_title: values.jobTitle.trim(),
  job_description: values.jobDescription.trim(),
  address: {
    address_name: values.addressName.trim(),
    address_line_1: values.addressLine1.trim(),
    suburb_name: values.suburbName.trim(),
    city_name: values.cityName.trim(),
    postal_code: values.postalCode.trim(),
    province: values.province.trim(),
  },
  employment_start_date: values.employmentStartDate,
  closing_date: values.closingDate,
  duration: values.duration.trim(),
  contract_type: values.contractType as HarambeeContractType,
  salary: values.salary.trim(),
  application_url: values.applicationUrl.trim(),
  reference_number: values.referenceNumber.trim() || null,
  archetypal_role: values.archetypalRole as HarambeeRole,
  job_profile_id_ref: jobProfileId,
})

// ── Field helpers (use the mandate form styles) ─────────────────────────

const Field = ({
  label,
  required,
  error,
  note,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  note?: string
  children: ReactNode
}) => (
  <div className={formStyles.field}>
    <label className={formStyles.label}>
      {label}
      {required && ' *'}
    </label>
    {children}
    {note && !error && <p className={styles.note}>{note}</p>}
    {error && <p className={formStyles.errorText}>{error}</p>}
  </div>
)

const TextInput = ({ className, hasError, ...rest }: InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) => (
  <input className={`${formStyles.input} ${hasError ? formStyles.hasError : ''} ${className ?? ''}`} {...rest} />
)

const SelectInput = ({
  ariaLabel,
  value,
  options,
  onChange,
  hasError,
}: {
  ariaLabel: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
  hasError?: boolean
}) => (
  <div className={formStyles.selectWrap}>
    <select
      aria-label={ariaLabel}
      className={`${formStyles.select} ${hasError ? formStyles.hasError : ''}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select</option>
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </div>
)

const HarambeePostPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { mandateId } = useParams<{ mandateId: string }>()

  const locationState = location.state as {
    isEdit?: boolean
    publishId?: string
    referenceId?: string
  } | null
  const publishId = searchParams.get('publishId') || locationState?.publishId
  const isEdit = Boolean(locationState?.isEdit || searchParams.get('isEdit') === 'true' || publishId)

  usePageTitle(isEdit ? 'Edit Job Post — Harambee' : 'New Job Post — Harambee')

  const [values, setValues] = useState<HarambeeFormValues>(initialValues)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notices, setNotices] = useState<string[]>([])
  // SA Youth opportunity id from the saved publish record; required to edit the advert.
  const [opportunityId, setOpportunityId] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false

    if (isEdit) {
      // Edit mode: load the saved advert from the publishes API instead of the job post.
      const params: HarambeePublishesParams = publishId
        ? { publish_id: publishId }
        : { job_profile_id_ref: mandateId }

      externalJobsApi
        .getHarambeePublishes(params)
        .then((records) => {
          if (cancelled || !Array.isArray(records)) return
          // One row per opportunity, newest first; PUBLISH and EDIT rows both hold the current state.
          const record =
            (publishId ? records.find((r) => r.publish_id === publishId) : undefined) ||
            records.find((r) => r.operation?.toUpperCase() !== 'DELETE') ||
            records[0]
          if (record) {
            setValues((prev) => applyPublishRecord(prev, record))
            setNotices([])
            setOpportunityId(record.harambee_opportunity_id ? String(record.harambee_opportunity_id) : undefined)
          }
        })
        .catch(() => {
          // fields stay as-is and can be filled in manually
        })
      return () => {
        cancelled = true
      }
    }

    // Create: first call the prefill endpoint to pre-populate the form from the job profile.
    externalJobsApi
      .getHarambeePrefill(mandateId)
      .then((response) => {
        if (cancelled) return
        setValues((prev) => applyPrefill(prev, response, mandateId))
        setNotices([
          ...response.warnings,
          ...response.missing_fields.map((field) => `Missing required field: ${field}`),
        ])
      })
      .catch(() => {
        // fields stay empty and can be filled in manually
      })
    return () => {
      cancelled = true
    }
  }, [mandateId, isEdit, publishId])

  const update = <K extends keyof HarambeeFormValues>(key: K, value: HarambeeFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const errors = validate(values)
  const isValid = Object.values(errors).every((message) => !message)
  // Only surface an error once the user has entered something in the field.
  const errorFor = (key: keyof HarambeeFormValues) => (values[key] ? errors[key] : undefined)

  const handleBack = () => navigate(-1)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!mandateId || !isValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = buildPublishRequest(values, mandateId)
      if (isEdit) {
        if (!opportunityId) {
          dispatch(pushNotification({
            level: 'error',
            title: 'Update failed',
            message: 'The Harambee opportunity ID is missing for this advert.',
          }))
          return
        }
        await externalJobsApi.updateHarambeeJob(opportunityId, payload)
        dispatch(pushNotification({
          level: 'success',
          title: 'Updated on Harambee',
          message: `"${values.jobTitle}" has been updated on Harambee.`,
        }))
        navigate(ROUTE_PATHS.recruiterAdvertisedJobs, {
          state: {
            platformName: 'Harambee',
            bannerMessage: `Job "${values.jobTitle}" successfully updated on Harambee.`,
          },
        })
      } else {
        await externalJobsApi.publishToHarambee(payload)
        dispatch(pushNotification({
          level: 'success',
          title: 'Published to Harambee',
          message: `"${values.jobTitle}" has been published to Harambee.`,
        }))
        navigate(ROUTE_PATHS.recruiterAdvertisedJobs, {
          state: {
            platformName: 'Harambee',
            bannerMessage: `Job "${values.jobTitle}" successfully published to Harambee.`,
          },
        })
      }
    } catch (error) {
      dispatch(pushNotification({
        level: 'error',
        title: isEdit ? 'Update failed' : 'Publish failed',
        message: extractErrorMessage(
          error,
          isEdit
            ? 'Could not update the job on Harambee. Please try again.'
            : 'Could not publish the job to Harambee. Please try again.',
        ),
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box className={pageStyles.shell}>
      <RecruiterSidebar />
      <Box className={pageStyles.pageRoot}>
        <Box className={pageStyles.pageHeader}>
          <button type="button" className={pageStyles.backBtn} onClick={handleBack}>
            ← Back
          </button>
          <Typography component="h1" className={pageStyles.pageTitle}>
            {isEdit ? 'Edit Harambee Advert' : 'Harambee'}
          </Typography>
        </Box>

        {notices.length > 0 && (
          <ul className={styles.notices} role="status">
            {notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Box className={pageStyles.card}>
            {/* ── Opportunity Details ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Opportunity Details</h2>

              <div className={formStyles.row}>
                <Field label="Job Title" required error={errorFor('jobTitle')} note="Opportunity title displayed on the listing">
                  <TextInput
                    placeholder="Junior Software Developer"
                    maxLength={200}
                    hasError={Boolean(errorFor('jobTitle'))}
                    value={values.jobTitle}
                    onChange={(e) => update('jobTitle', e.target.value)}
                  />
                </Field>
                <Field label="Reference Number" error={errorFor('referenceNumber')} note="Your own reference number for this opportunity">
                  <TextInput
                    placeholder="SM-DEV-001"
                    maxLength={250}
                    hasError={Boolean(errorFor('referenceNumber'))}
                    value={values.referenceNumber}
                    onChange={(e) => update('referenceNumber', e.target.value)}
                  />
                </Field>
              </div>

              <div className={formStyles.field}>
                <label className={formStyles.label}>Job Description *</label>
                <textarea
                  aria-label="Job Description"
                  className={formStyles.textarea}
                  rows={6}
                  value={values.jobDescription}
                  onChange={(e) => update('jobDescription', e.target.value)}
                />
                <p className={styles.note}>What the work-seeker will do. Plain text or HTML (HTML is sanitised by SA Youth).</p>
              </div>

              <div className={formStyles.row}>
                <Field label="Archetypal Role" required error={errorFor('archetypalRole')} note="SA Youth archetypal role that broadly matches the role offered">
                  <SelectInput
                    ariaLabel="Archetypal Role"
                    value={values.archetypalRole}
                    options={HARAMBEE_ROLES}
                    onChange={(v) => update('archetypalRole', v)}
                  />
                </Field>
                <Field label="Contract Type" required error={errorFor('contractType')} note="SA Youth contract type">
                  <SelectInput
                    ariaLabel="Contract Type"
                    value={values.contractType}
                    options={HARAMBEE_CONTRACT_TYPES}
                    onChange={(v) => update('contractType', v)}
                  />
                </Field>
              </div>
            </section>

            {/* ── Address ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Address</h2>

              <div className={formStyles.row}>
                <Field
                  label="Address Name"
                  required
                  error={errorFor('addressName')}
                  note="Friendly label for this location, e.g. Cape Town Head Office. Letters, digits, underscores and spaces only."
                >
                  <TextInput
                    placeholder="Cape Town Head Office"
                    maxLength={100}
                    hasError={Boolean(errorFor('addressName'))}
                    value={values.addressName}
                    onChange={(e) => update('addressName', e.target.value)}
                  />
                </Field>
                <Field label="Address Line 1" required error={errorFor('addressLine1')}>
                  <TextInput
                    placeholder="1 Long Street"
                    maxLength={500}
                    hasError={Boolean(errorFor('addressLine1'))}
                    value={values.addressLine1}
                    onChange={(e) => update('addressLine1', e.target.value)}
                  />
                </Field>
              </div>

              <div className={styles.rowThree}>
                <Field label="Suburb" required error={errorFor('suburbName')}>
                  <TextInput
                    placeholder="Cape Town City Centre"
                    maxLength={100}
                    hasError={Boolean(errorFor('suburbName'))}
                    value={values.suburbName}
                    onChange={(e) => update('suburbName', e.target.value)}
                  />
                </Field>
                <Field label="City" required error={errorFor('cityName')}>
                  <TextInput
                    placeholder="Cape Town"
                    maxLength={100}
                    hasError={Boolean(errorFor('cityName'))}
                    value={values.cityName}
                    onChange={(e) => update('cityName', e.target.value)}
                  />
                </Field>
                <Field label="Province" required error={errorFor('province')}>
                  <TextInput
                    placeholder="Western Cape"
                    maxLength={50}
                    hasError={Boolean(errorFor('province'))}
                    value={values.province}
                    onChange={(e) => update('province', e.target.value)}
                  />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Postal Code" required error={errorFor('postalCode')}>
                  <TextInput
                    inputMode="numeric"
                    placeholder="8001"
                    maxLength={4}
                    hasError={Boolean(errorFor('postalCode'))}
                    value={values.postalCode}
                    onChange={(e) => update('postalCode', e.target.value.replace(/\D/g, ''))}
                  />
                </Field>
              </div>
            </section>

            {/* ── Terms & Application ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Terms &amp; Application</h2>

              <div className={styles.rowThree}>
                <Field label="Closing Date" required error={errorFor('closingDate')} note="Date the listing closes. Must be in the future.">
                  <TextInput
                    type="date"
                    aria-label="Closing Date"
                    hasError={Boolean(errorFor('closingDate'))}
                    value={values.closingDate}
                    onChange={(e) => update('closingDate', e.target.value)}
                  />
                </Field>
                <Field label="Employment Start Date" required error={errorFor('employmentStartDate')} note="Must be after the closing date.">
                  <TextInput
                    type="date"
                    aria-label="Employment Start Date"
                    hasError={Boolean(errorFor('employmentStartDate'))}
                    value={values.employmentStartDate}
                    onChange={(e) => update('employmentStartDate', e.target.value)}
                  />
                </Field>
                <Field label="Duration" required error={errorFor('duration')} note="e.g. Permanent, 12 month contract">
                  <TextInput
                    placeholder="Permanent"
                    maxLength={200}
                    hasError={Boolean(errorFor('duration'))}
                    value={values.duration}
                    onChange={(e) => update('duration', e.target.value)}
                  />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Salary" required error={errorFor('salary')} note="e.g. Market Related, R12 000.00 Per Month">
                  <TextInput
                    placeholder="R 15 000 Per Month"
                    maxLength={200}
                    hasError={Boolean(errorFor('salary'))}
                    value={values.salary}
                    onChange={(e) => update('salary', e.target.value)}
                  />
                </Field>
                <Field label="Application URL" required error={errorFor('applicationUrl')} note="URL on the SkillsMine portal where work-seekers apply">
                  <TextInput
                    type="url"
                    placeholder="https://"
                    hasError={Boolean(errorFor('applicationUrl'))}
                    value={values.applicationUrl}
                    onChange={(e) => update('applicationUrl', e.target.value)}
                  />
                </Field>
              </div>
            </section>
          </Box>

          <StickyFooter
            isSubmitting={isSubmitting}
            submitLabel={isEdit ? 'Update on Harambee' : 'Publish to Harambee'}
            isValid={isValid}
          />
        </form>
      </Box>
    </Box>
  )
}

export default HarambeePostPage
