import { useEffect, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { StickyFooter } from '@/modules/recruiter/components/mandate/StickyFooter'
import {
  BIZ_BENEFITS,
  BIZ_CATEGORIES,
  BIZ_CITY_PROVINCE,
  BIZ_EDUCATION_LEVELS,
  BIZ_EMPLOYMENT_EQUITY,
  BIZ_EMPLOYMENT_TYPES,
  BIZ_INDUSTRIES,
  BIZ_PROVINCES,
  BIZ_REMUNERATION_BASES,
  BIZ_REMUNERATION_PACKAGES,
  BIZ_SENIORITY_LEVELS,
  BIZ_TRAVEL_REQUIREMENTS,
} from '@/modules/recruiter/data/bizcommunityOptions'
import {
  externalJobsApi,
  type BizCommunityPrefill,
  type BizCommunityPrefillResponse,
  type PublishBizCommunityJobRequest,
  type UpdateBizCommunityJobRequest,
} from '@/services/api/externalJobsApi'
import { mandateApi } from '@/services/api/mandateApi'
import { extractErrorMessage } from '@/app/errorUtils'
import { pushNotification } from '@/store/slices/notificationSlice'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { JobPost } from '@/types/api'
import pageStyles from './NewMandatePage.module.css'
import formStyles from '@/modules/recruiter/components/mandate/form.module.css'
import styles from './BizCommunityPostPage.module.css'

const COMPANY_NAME = 'THE SKILLS MINE'

type BizFormValues = {
  jobTitle: string
  province: string
  city: string
  description: string
  industry: string
  category: string
  travel: string
  skillsRequired: string
  advantageousSkills: string
  personalSkills: string
  remunerationPackage: string
  remunerationFrom: string
  remunerationTo: string
  remunerationBasis: string
  negotiable: boolean
  ownTransport: boolean
  benefits: string
  employmentType: string
  seniority: string
  education: string
  equity: string
  clientDescription: string
  companyName: string
  companyWebsite: string
  adminEmail: string
  adminFirstName: string
  adminLastName: string
  expiryDate: string
}

const initialValues: BizFormValues = {
  jobTitle: '',
  province: '',
  city: '',
  description: '',
  industry: '',
  category: '',
  travel: '',
  skillsRequired: '',
  advantageousSkills: '',
  personalSkills: '',
  remunerationPackage: '',
  remunerationFrom: '0',
  remunerationTo: '0',
  remunerationBasis: '',
  negotiable: false,
  ownTransport: false,
  benefits: '',
  employmentType: '',
  seniority: '',
  education: '',
  equity: '',
  clientDescription: '',
  companyName: COMPANY_NAME,
  companyWebsite: '',
  adminEmail: '',
  adminFirstName: '',
  adminLastName: '',
  expiryDate: '',
}

const toBullets = (lines: string[] | undefined) =>
  (lines ?? []).map((line) => `• ${line.replace(/^•\s*/, '')}`).join('\n')

const toDescription = (post: JobPost) => {
  const requirements = toBullets(post.requirements)
  const responsibilities = toBullets(post.responsibilities)
  return [
    requirements && `Requirements:\n${requirements}`,
    responsibilities && `Responsibilities:\n${responsibilities}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

const toValues = (post: JobPost): BizFormValues => {
  const city = post.location?.split(',')[0]?.trim() ?? ''
  const [firstName = '', ...rest] = (post.contactPersonName ?? '').trim().split(/\s+/)
  return {
    ...initialValues,
    jobTitle: post.title ?? '',
    city,
    province: BIZ_CITY_PROVINCE[city] ?? '',
    description: toDescription(post),
    industry: post.industry ?? '',
    skillsRequired: (post.skills ?? []).join(', '),
    remunerationFrom: String(post.salaryMin || 0),
    remunerationTo: String(post.salaryMax || 0),
    employmentType: post.employmentType ?? '',
    seniority: post.experienceLevel ?? '',
    clientDescription: post.industry ? `Our client is in the ${post.industry} industry.` : '',
    adminEmail: post.contactPersonEmail ?? '',
    adminFirstName: firstName,
    adminLastName: rest.join(' '),
    expiryDate: post.targetCloseDate ? post.targetCloseDate.split('T')[0] : '',
  }
}

// Overlays the BizCommunity prefill on the form values. Only fields the API
// actually returned are applied, so job-post-derived values remain as fallbacks.
// Numeric ids (country_id, industry_id, remote_work, remuneration_currency) and the
// contact/reference fields have no matching UI field yet.
const applyPrefill = (base: BizFormValues, { prefill }: BizCommunityPrefillResponse): BizFormValues => {
  const next = { ...base }
  if (prefill.job_title) next.jobTitle = prefill.job_title
  if (prefill.job_description) next.description = prefill.job_description
  if (prefill.city_name) {
    next.city = prefill.city_name
    next.province = BIZ_CITY_PROVINCE[prefill.city_name] ?? next.province
  }
  if (prefill.skills_required) next.skillsRequired = prefill.skills_required
  if (prefill.remuneration_minimum != null) next.remunerationFrom = String(prefill.remuneration_minimum)
  if (prefill.remuneration_maximum != null) next.remunerationTo = String(prefill.remuneration_maximum)
  if (prefill.is_permanent) next.employmentType = 'Permanent'
  if (prefill.admin_email_address) next.adminEmail = prefill.admin_email_address
  if (prefill.admin_first_name) next.adminFirstName = prefill.admin_first_name
  if (prefill.admin_last_name) next.adminLastName = prefill.admin_last_name
  return next
}

const digitsOnly = (raw: string) => raw.replace(/\D/g, '') || '0'

const isFilled = (value: string) => value.trim().length > 0

// The date input yields yyyy-MM-dd; the API expects yyyyMMdd.
const toApiDate = (isoDate: string) => isoDate.replace(/-/g, '')

const buildPublishRequest = (
  values: BizFormValues,
  prefill: BizCommunityPrefill,
  jobProfileId: string,
  countryId: number,
): PublishBizCommunityJobRequest => {
  const from = Number(values.remunerationFrom)
  const to = Number(values.remunerationTo)
  const employmentType = values.employmentType
  const request: PublishBizCommunityJobRequest = {
    // IDs / contact data that only the prefill knows about
    ...prefill,
    country_id: countryId,
    job_profile_id_ref: jobProfileId,
    // Portal redirect URL for applicants
    response_handler_url: `${window.location.origin}${ROUTE_PATHS.jobDetails.replace(':jobId', jobProfileId)}`,
    // User-editable form fields win over the prefill
    job_title: values.jobTitle.trim(),
    job_description: values.description.trim(),
    city_name: values.city.trim(),
    admin_email_address: values.adminEmail.trim(),
    admin_first_name: values.adminFirstName.trim(),
    admin_last_name: values.adminLastName.trim(),
    skills_required: values.skillsRequired.trim() || undefined,
    remuneration_minimum: from > 0 ? from : undefined,
    remuneration_maximum: to > 0 ? to : undefined,
    remuneration_negotiable: values.negotiable,
    own_transport: values.ownTransport,
    is_permanent: employmentType === 'Permanent',
    is_temporary: employmentType === 'Temporary',
    is_contract: employmentType === 'Contract',
    company_name: values.companyName.trim() || undefined,
    company_website: values.companyWebsite.trim() || undefined,
    company_description: values.clientDescription.trim() || undefined,
    expiry_date: values.expiryDate ? toApiDate(values.expiryDate) : undefined,
  }
  return request
}

const buildUpdateRequest = (
  values: BizFormValues,
  prefill: BizCommunityPrefill,
  jobProfileId: string,
  countryId?: number,
): UpdateBizCommunityJobRequest => {
  const from = Number(values.remunerationFrom)
  const to = Number(values.remunerationTo)
  const employmentType = values.employmentType
  const request: UpdateBizCommunityJobRequest = {
    ...prefill,
    country_id: countryId,
    job_profile_id_ref: jobProfileId,
    response_handler_url: `${window.location.origin}${ROUTE_PATHS.jobDetails.replace(':jobId', jobProfileId)}`,
    job_title: values.jobTitle.trim(),
    job_description: values.description.trim(),
    city_name: values.city.trim(),
    admin_email_address: values.adminEmail.trim(),
    admin_first_name: values.adminFirstName.trim(),
    admin_last_name: values.adminLastName.trim(),
    skills_required: values.skillsRequired.trim() || undefined,
    skills_advantageous: values.advantageousSkills.trim() || undefined,
    personal_skills: values.personalSkills.trim() || undefined,
    remuneration_minimum: from > 0 ? from : undefined,
    remuneration_maximum: to > 0 ? to : undefined,
    remuneration_negotiable: values.negotiable,
    own_transport: values.ownTransport,
    is_permanent: employmentType === 'Permanent',
    is_temporary: employmentType === 'Temporary',
    is_contract: employmentType === 'Contract',
    company_name: values.companyName.trim() || undefined,
    company_website: values.companyWebsite.trim() || undefined,
    company_description: values.clientDescription.trim() || undefined,
  }
  return request
}

// ── Field helpers (use the mandate form styles) ─────────────────────────

const Field = ({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) => (
  <div className={formStyles.field}>
    <label className={formStyles.label}>
      {label}
      {required && ' *'}
    </label>
    {children}
  </div>
)

const TextInput = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={`${formStyles.input} ${className ?? ''}`} {...rest} />
)

type SelectInputProps = {
  ariaLabel: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const SelectInput = ({ ariaLabel, value, options, onChange, placeholder = 'Select', disabled }: SelectInputProps) => {
  const items = value && !options.includes(value) ? [value, ...options] : options
  return (
    <div className={formStyles.selectWrap}>
      <select
        aria-label={ariaLabel}
        className={formStyles.select}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{placeholder}</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  )
}

const TextAreaField = ({
  label,
  value,
  rows,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  rows: number
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <div className={formStyles.field}>
    <label className={formStyles.label}>{label}</label>
    <textarea
      aria-label={label}
      className={formStyles.textarea}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
)

const ToggleField = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className={styles.toggleRow}>
    <span className={styles.toggleLabel} onClick={() => onChange(!checked)}>{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleThumb} />
    </button>
  </div>
)

const BizCommunityPostPage = () => {
  usePageTitle('New Job Post — bizCommunity')
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const { mandateId } = useParams<{ mandateId: string }>()
  const locationState = location.state as { bizJobId?: string | number; isEdit?: boolean } | null
  const bizJobId = searchParams.get('bizJobId') || locationState?.bizJobId

  const [values, setValues] = useState<BizFormValues>(initialValues)
  const [prefill, setPrefill] = useState<BizCommunityPrefill>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clientName, setClientName] = useState('')
  const [notices, setNotices] = useState<string[]>([])

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false
    Promise.allSettled([
      mandateApi.getJobPostDetail(mandateId),
      externalJobsApi.getBizCommunityPrefill(mandateId),
    ]).then(([postResult, prefillResult]) => {
      if (cancelled) return
      let next = initialValues
      if (postResult.status === 'fulfilled') {
        next = toValues(postResult.value.data)
        setClientName(postResult.value.data.client ?? '')
      }
      if (prefillResult.status === 'fulfilled') {
        const response = prefillResult.value
        next = applyPrefill(next, response)
        setPrefill(response.prefill)
        setNotices([
          ...response.warnings,
          ...response.missing_fields.map((field) => `Missing required field: ${field}`),
        ])
      }
      // on failure the fields stay as-is and can be filled in manually
      setValues(next)
    })
    return () => {
      cancelled = true
    }
  }, [mandateId])

  const update = <K extends keyof BizFormValues>(key: K, value: BizFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleBack = () => navigate(ROUTE_PATHS.recruiterAdvertiseJob.replace(':mandateId', mandateId ?? ''))
  const heading = clientName ? `${clientName} – Bizcommunity` : 'Bizcommunity'

  const isValid =
    isFilled(values.jobTitle) &&
    isFilled(values.description) &&
    isFilled(values.city) &&
    isFilled(values.adminEmail) &&
    isFilled(values.adminFirstName) &&
    isFilled(values.adminLastName)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!mandateId || !isValid || isSubmitting) return

    if (prefill.country_id == null) {
      dispatch(pushNotification({
        level: 'error',
        title: 'Cannot publish to Bizcommunity',
        message: 'A country could not be resolved for this job post.',
      }))
      return
    }

    setIsSubmitting(true)
    try {
      if (bizJobId) {
        await externalJobsApi.updateBizCommunityJob(
          bizJobId,
          buildUpdateRequest(values, prefill, mandateId, prefill.country_id),
        )
        dispatch(pushNotification({
          level: 'success',
          title: 'Updated on Bizcommunity',
          message: `"${values.jobTitle}" has been updated on Bizcommunity.`,
        }))
        navigate(ROUTE_PATHS.recruiterAdvertisedJobs, {
          state: {
            platformName: 'Bizcommunity',
            bannerMessage: `Job "${values.jobTitle}" successfully updated on Bizcommunity.`,
          },
        })
      } else {
        await externalJobsApi.publishToBizCommunity(
          buildPublishRequest(values, prefill, mandateId, prefill.country_id),
        )
        dispatch(pushNotification({
          level: 'success',
          title: 'Published to Bizcommunity',
          message: `"${values.jobTitle}" has been published to Bizcommunity.`,
        }))
        navigate(ROUTE_PATHS.recruiterAdvertisedJobs, {
          state: { platformName: 'Bizcommunity' },
        })
      }
    } catch (error) {
      dispatch(pushNotification({
        level: 'error',
        title: bizJobId ? 'Update failed' : 'Publish failed',
        message: extractErrorMessage(
          error,
          bizJobId
            ? 'Could not update the job on Bizcommunity. Please try again.'
            : 'Could not publish the job to Bizcommunity. Please try again.',
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
            {heading}
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
            {/* ── Position Details ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Position Details</h2>

              <div className={styles.rowThree}>
                <Field label="Job Title" required>
                  <TextInput
                    placeholder="Job Title"
                    value={values.jobTitle}
                    onChange={(e) => update('jobTitle', e.target.value)}
                  />
                  <p className={styles.note}>Please do not include locations in job titles</p>
                </Field>
                <Field label="Province">
                  <SelectInput ariaLabel="Province" value={values.province} options={BIZ_PROVINCES} onChange={(v) => update('province', v)} />
                </Field>
                <Field label="City" required>
                  <TextInput placeholder="City" value={values.city} onChange={(e) => update('city', e.target.value)} />
                </Field>
              </div>

              <TextAreaField
                label="Job Description"
                rows={6}
                value={values.description}
                onChange={(v) => update('description', v)}
              />

              <div className={styles.rowThree}>
                <Field label="Industry">
                  <SelectInput
                    ariaLabel="Industry"
                    value={values.industry}
                    options={BIZ_INDUSTRIES}
                    onChange={(v) => setValues((prev) => ({ ...prev, industry: v, category: '' }))}
                  />
                </Field>
                <Field label="Category">
                  <SelectInput
                    ariaLabel="Category"
                    placeholder={values.industry ? 'Select' : 'Select industry first'}
                    disabled={!values.industry}
                    value={values.category}
                    options={BIZ_CATEGORIES}
                    onChange={(v) => update('category', v)}
                  />
                </Field>
                <Field label="Travel Requirement">
                  <SelectInput ariaLabel="Travel Requirement" value={values.travel} options={BIZ_TRAVEL_REQUIREMENTS} onChange={(v) => update('travel', v)} />
                </Field>
              </div>
            </section>

            {/* ── Skills ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Skills</h2>
              <TextAreaField label="Skills Required" rows={3} value={values.skillsRequired} onChange={(v) => update('skillsRequired', v)} />
              <TextAreaField
                label="Advantageous Skills"
                rows={3}
                placeholder="List nice-to-have skills for the role."
                value={values.advantageousSkills}
                onChange={(v) => update('advantageousSkills', v)}
              />
              <TextAreaField
                label="Personal Skills"
                rows={3}
                placeholder="Outline behavioural or soft skills."
                value={values.personalSkills}
                onChange={(v) => update('personalSkills', v)}
              />
            </section>

            {/* ── Remuneration ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Remuneration</h2>

              <div className={styles.rowFour}>
                <Field label="Remuneration Package" required>
                  <SelectInput ariaLabel="Remuneration Package" value={values.remunerationPackage} options={BIZ_REMUNERATION_PACKAGES} onChange={(v) => update('remunerationPackage', v)} />
                </Field>
                <Field label="Remuneration From (R)">
                  <TextInput inputMode="numeric" placeholder="0" value={values.remunerationFrom} onChange={(e) => update('remunerationFrom', digitsOnly(e.target.value))} />
                </Field>
                <Field label="Remuneration To (R)">
                  <TextInput inputMode="numeric" placeholder="0" value={values.remunerationTo} onChange={(e) => update('remunerationTo', digitsOnly(e.target.value))} />
                </Field>
                <Field label="Remuneration Basis">
                  <SelectInput ariaLabel="Remuneration Basis" value={values.remunerationBasis} options={BIZ_REMUNERATION_BASES} onChange={(v) => update('remunerationBasis', v)} />
                </Field>
              </div>

              <div className={styles.checks}>
                <ToggleField label="Remuneration Negotiable" checked={values.negotiable} onChange={(v) => update('negotiable', v)} />
                <ToggleField label="Own Transport Required" checked={values.ownTransport} onChange={(v) => update('ownTransport', v)} />
              </div>

              <div className={formStyles.row}>
                <Field label="Benefits">
                  <SelectInput ariaLabel="Benefits" value={values.benefits} options={BIZ_BENEFITS} onChange={(v) => update('benefits', v)} />
                </Field>
                <Field label="Employment Type" required>
                  <SelectInput ariaLabel="Employment Type" value={values.employmentType} options={BIZ_EMPLOYMENT_TYPES} onChange={(v) => update('employmentType', v)} />
                </Field>
              </div>
            </section>

            {/* ── Candidate Profile ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Candidate Profile</h2>
              <div className={styles.rowThree}>
                <Field label="Seniority Level">
                  <SelectInput ariaLabel="Seniority Level" value={values.seniority} options={BIZ_SENIORITY_LEVELS} onChange={(v) => update('seniority', v)} />
                </Field>
                <Field label="Education Level">
                  <SelectInput ariaLabel="Education Level" value={values.education} options={BIZ_EDUCATION_LEVELS} onChange={(v) => update('education', v)} />
                </Field>
                <Field label="Employment Equity">
                  <SelectInput ariaLabel="Employment Equity" value={values.equity} options={BIZ_EMPLOYMENT_EQUITY} onChange={(v) => update('equity', v)} />
                </Field>
              </div>
            </section>

            {/* ── Company Information ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Company Information</h2>
              <TextAreaField label="Client Description" rows={3} value={values.clientDescription} onChange={(v) => update('clientDescription', v)} />

              <div className={formStyles.row}>
                <Field label="Company Name">
                  <TextInput placeholder="Company Name" value={values.companyName} onChange={(e) => update('companyName', e.target.value)} />
                </Field>
                <Field label="Company Website">
                  <TextInput placeholder="Company Website" value={values.companyWebsite} onChange={(e) => update('companyWebsite', e.target.value)} />
                </Field>
              </div>

              <div className={styles.rowThree}>
                <Field label="Admin Email">
                  <TextInput type="email" placeholder="Admin Email" value={values.adminEmail} onChange={(e) => update('adminEmail', e.target.value)} />
                </Field>
                <Field label="Admin First Name">
                  <TextInput placeholder="Admin First Name" value={values.adminFirstName} onChange={(e) => update('adminFirstName', e.target.value)} />
                </Field>
                <Field label="Admin Last Name">
                  <TextInput placeholder="Admin Last Name" value={values.adminLastName} onChange={(e) => update('adminLastName', e.target.value)} />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Expiry Date">
                  <TextInput type="date" aria-label="Expiry Date" value={values.expiryDate} onChange={(e) => update('expiryDate', e.target.value)} />
                </Field>
              </div>
            </section>
          </Box>

          <StickyFooter
            isSubmitting={isSubmitting}
            submitLabel={bizJobId ? 'Update on Bizcommunity' : 'Publish to Bizcommunity'}
            isValid={isValid}
          />
        </form>
      </Box>
    </Box>
  )
}

export default BizCommunityPostPage
