import { useEffect, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { StickyFooter } from '@/modules/recruiter/components/mandate/StickyFooter'
import {
  BIZ_CITY_PROVINCE,
  BIZ_EDUCATION_LEVEL_IDS,
  BIZ_EDUCATION_LEVELS,
  BIZ_EMPLOYMENT_EQUITY,
  BIZ_EMPLOYMENT_EQUITY_IDS,
  BIZ_EMPLOYMENT_TYPES,
  BIZ_PROVINCE_IDS,
  BIZ_PROVINCES,
  BIZ_REMUNERATION_BASES,
  BIZ_REMUNERATION_BASIS_IDS,
  BIZ_REMUNERATION_PACKAGE_IDS,
  BIZ_REMUNERATION_PACKAGES,
  BIZ_SENIORITY_LEVEL_IDS,
  BIZ_SENIORITY_LEVELS,
  BIZ_TRAVEL_REQUIREMENT_IDS,
  BIZ_TRAVEL_REQUIREMENTS,
} from '@/modules/recruiter/data/bizcommunityOptions'
import {
  externalJobsApi,
  type BizCommunityPrefill,
  type BizCommunityPrefillResponse,
  type BizCommunityPublishRecord,
  type PublishBizCommunityJobRequest,
  type UpdateBizCommunityJobRequest,
} from '@/services/api/externalJobsApi'
import { resolveBizCommunityIndustryId, resolveBizCommunityIndustryName } from '@/services/api/industryApi'
import { extractErrorMessage } from '@/app/errorUtils'
import { pushNotification } from '@/store/slices/notificationSlice'
import { useGetIndustriesQuery } from '@/store/api/apiSlice'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
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

// Overlays the BizCommunity prefill on the form values. Only fields the API
// actually returned are applied; everything else keeps its default.
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
  if (prefill.skills_advantageous) next.advantageousSkills = prefill.skills_advantageous
  if (prefill.personal_skills) next.personalSkills = prefill.personal_skills
  if (prefill.benefits) next.benefits = prefill.benefits
  const travelLabel = Object.entries(BIZ_TRAVEL_REQUIREMENT_IDS).find(([, id]) => id === prefill.travel_requirement)?.[0]
  if (travelLabel) next.travel = travelLabel
  const provinceLabel = Object.entries(BIZ_PROVINCE_IDS).find(([, id]) => id === prefill.area_id)?.[0]
  if (provinceLabel) next.province = provinceLabel
  if (prefill.remuneration_minimum != null) next.remunerationFrom = String(prefill.remuneration_minimum)
  if (prefill.remuneration_maximum != null) next.remunerationTo = String(prefill.remuneration_maximum)
  const packageLabel = Object.entries(BIZ_REMUNERATION_PACKAGE_IDS).find(([, id]) => id === prefill.remuneration_package)?.[0]
  if (packageLabel) next.remunerationPackage = packageLabel
  const basisLabel = Object.entries(BIZ_REMUNERATION_BASIS_IDS).find(([, id]) => id === prefill.remuneration_basis)?.[0]
  if (basisLabel) next.remunerationBasis = basisLabel
  const seniorityLabel = Object.entries(BIZ_SENIORITY_LEVEL_IDS).find(([, id]) => id === prefill.seniority_level)?.[0]
  if (seniorityLabel) next.seniority = seniorityLabel
  const educationLabel = Object.entries(BIZ_EDUCATION_LEVEL_IDS).find(([, id]) => id === prefill.education_level)?.[0]
  if (educationLabel) next.education = educationLabel
  const equityLabel = Object.entries(BIZ_EMPLOYMENT_EQUITY_IDS).find(([, id]) => id === prefill.employment_equity_policy)?.[0]
  if (equityLabel) next.equity = equityLabel
  if (prefill.is_permanent) next.employmentType = 'Permanent'
  if (prefill.admin_email_address) next.adminEmail = prefill.admin_email_address
  if (prefill.admin_first_name) next.adminFirstName = prefill.admin_first_name
  if (prefill.admin_last_name) next.adminLastName = prefill.admin_last_name
  return next
}

// Edit mode: maps a stored publish record onto the same shape the prefill uses.
const publishRecordToPrefill = (record: BizCommunityPublishRecord): BizCommunityPrefill => ({
  job_title: record.job_title,
  job_description: record.job_description,
  city_name: record.city_name,
  country_id: record.country_id,
  area_id: record.area_id,
  remote_work: record.remote_work,
  industry_id: record.industry_id,
  skills_required: record.skills_required,
  skills_advantageous: record.skills_advantageous,
  personal_skills: record.personal_skills,
  benefits: record.benefits,
  travel_requirement: record.travel_requirement,
  remuneration_minimum: record.remuneration_minimum,
  remuneration_maximum: record.remuneration_maximum,
  remuneration_currency: record.remuneration_currency,
  remuneration_package: record.remuneration_package,
  remuneration_basis: record.remuneration_basis,
  seniority_level: record.seniority_level,
  education_level: record.education_level,
  employment_equity_policy: record.employment_equity_policy,
  is_permanent: record.is_permanent,
  contact_name: record.contact_name,
  contact_telephone_number: record.contact_telephone_number,
  reference_number: record.reference_number,
  admin_email_address: record.admin_email_address,
  admin_first_name: record.admin_first_name,
  admin_last_name: record.admin_last_name,
})

const applyPublishRecord = (record: BizCommunityPublishRecord): BizFormValues => {
  const next = applyPrefill(initialValues, {
    job_profile_id: record.job_profile_id_ref,
    missing_fields: [],
    warnings: [],
    prefill: publishRecordToPrefill(record),
  })
  if (record.is_contract) next.employmentType = 'Contract'
  else if (record.is_temporary) next.employmentType = 'Temporary'
  if (record.company_name) next.companyName = record.company_name
  if (record.company_website) next.companyWebsite = record.company_website
  if (record.company_description) next.clientDescription = record.company_description
  if (record.remuneration_negotiable != null) next.negotiable = record.remuneration_negotiable
  if (record.own_transport != null) next.ownTransport = record.own_transport
  if (record.expiry_date) next.expiryDate = fromApiDate(record.expiry_date)
  return next
}

const digitsOnly = (raw: string) => raw.replace(/\D/g, '') || '0'

const isFilled = (value: string) => value.trim().length > 0

// The date input yields yyyy-MM-dd; the API expects yyyyMMdd.
const toApiDate = (isoDate: string) => isoDate.replace(/-/g, '')

// Reverse of toApiDate: accepts yyyyMMdd or an ISO date/datetime and returns yyyy-MM-dd.
const fromApiDate = (apiDate: string) => {
  if (/^\d{8}$/.test(apiDate)) return `${apiDate.slice(0, 4)}-${apiDate.slice(4, 6)}-${apiDate.slice(6, 8)}`
  return apiDate.slice(0, 10)
}

const buildPublishRequest = (
  values: BizFormValues,
  prefill: BizCommunityPrefill,
  jobProfileId: string,
  countryId: number,
  industryId?: number,
): PublishBizCommunityJobRequest => {
  const from = Number(values.remunerationFrom)
  const to = Number(values.remunerationTo)
  const employmentType = values.employmentType
  const request: PublishBizCommunityJobRequest = {
    // IDs / contact data that only the prefill knows about
    ...prefill,
    country_id: countryId,
    industry_id: industryId ?? prefill.industry_id,
    job_profile_id_ref: jobProfileId,
    // Portal redirect URL for applicants
    response_handler_url: `${window.location.origin}${ROUTE_PATHS.jobDetails.replace(':jobId', jobProfileId)}`,
    // User-editable form fields win over the prefill
    job_title: values.jobTitle.trim(),
    job_description: values.description.trim(),
    city_name: values.city.trim(),
    area_id: BIZ_PROVINCE_IDS[values.province] ?? prefill.area_id,
    admin_email_address: values.adminEmail.trim(),
    admin_first_name: values.adminFirstName.trim(),
    admin_last_name: values.adminLastName.trim(),
    skills_required: values.skillsRequired.trim() || undefined,
    skills_advantageous: values.advantageousSkills.trim() || undefined,
    personal_skills: values.personalSkills.trim() || undefined,
    benefits: values.benefits.trim() || undefined,
    travel_requirement: BIZ_TRAVEL_REQUIREMENT_IDS[values.travel],
    remuneration_minimum: from > 0 ? from : undefined,
    remuneration_maximum: to > 0 ? to : undefined,
    remuneration_package: BIZ_REMUNERATION_PACKAGE_IDS[values.remunerationPackage],
    remuneration_basis: BIZ_REMUNERATION_BASIS_IDS[values.remunerationBasis],
    seniority_level: BIZ_SENIORITY_LEVEL_IDS[values.seniority],
    education_level: BIZ_EDUCATION_LEVEL_IDS[values.education],
    employment_equity_policy: BIZ_EMPLOYMENT_EQUITY_IDS[values.equity],
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
  industryId?: number,
): UpdateBizCommunityJobRequest => {
  const from = Number(values.remunerationFrom)
  const to = Number(values.remunerationTo)
  const employmentType = values.employmentType
  const request: UpdateBizCommunityJobRequest = {
    ...prefill,
    country_id: countryId,
    industry_id: industryId ?? prefill.industry_id,
    job_profile_id_ref: jobProfileId,
    response_handler_url: `${window.location.origin}${ROUTE_PATHS.jobDetails.replace(':jobId', jobProfileId)}`,
    job_title: values.jobTitle.trim(),
    job_description: values.description.trim(),
    city_name: values.city.trim(),
    area_id: BIZ_PROVINCE_IDS[values.province] ?? prefill.area_id,
    admin_email_address: values.adminEmail.trim(),
    admin_first_name: values.adminFirstName.trim(),
    admin_last_name: values.adminLastName.trim(),
    skills_required: values.skillsRequired.trim() || undefined,
    skills_advantageous: values.advantageousSkills.trim() || undefined,
    personal_skills: values.personalSkills.trim() || undefined,
    benefits: values.benefits.trim() || undefined,
    travel_requirement: BIZ_TRAVEL_REQUIREMENT_IDS[values.travel],
    expiry_date: values.expiryDate ? toApiDate(values.expiryDate) : undefined,
    remuneration_minimum: from > 0 ? from : undefined,
    remuneration_maximum: to > 0 ? to : undefined,
    remuneration_package: BIZ_REMUNERATION_PACKAGE_IDS[values.remunerationPackage],
    remuneration_basis: BIZ_REMUNERATION_BASIS_IDS[values.remunerationBasis],
    seniority_level: BIZ_SENIORITY_LEVEL_IDS[values.seniority],
    education_level: BIZ_EDUCATION_LEVEL_IDS[values.education],
    employment_equity_policy: BIZ_EMPLOYMENT_EQUITY_IDS[values.equity],
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
  const [notices, setNotices] = useState<string[]>([])
  const { data: industries = [] } = useGetIndustriesQuery()

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false
    if (bizJobId) {
      // Edit: load the saved advert from our publishes table instead of the prefill.
      externalJobsApi
        .getBizCommunityPublishes({ biz_job_id: String(bizJobId) })
        .then(async (records) => {
          const record = Array.isArray(records) ? records[0] : undefined
          if (cancelled || !record) return
          const industry = await resolveBizCommunityIndustryName(record.industry_id).catch(() => undefined)
          if (cancelled) return
          setValues({ ...applyPublishRecord(record), industry: industry ?? '' })
          setPrefill(publishRecordToPrefill(record))
          setNotices([])
        })
        .catch(() => {
          // fields stay as-is and can be filled in manually
        })
      return () => {
        cancelled = true
      }
    }
    externalJobsApi
      .getBizCommunityPrefill(mandateId)
      .then((response) => {
        if (cancelled) return
        setValues(applyPrefill(initialValues, response))
        setPrefill(response.prefill)
        setNotices([
          ...response.warnings,
          ...response.missing_fields.map((field) => `Missing required field: ${field}`),
        ])
      })
      .catch(() => {
        // fields stay as-is and can be filled in manually
      })
    return () => {
      cancelled = true
    }
  }, [mandateId, bizJobId])

  const update = <K extends keyof BizFormValues>(key: K, value: BizFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleBack = () => navigate(ROUTE_PATHS.recruiterAdvertiseJob.replace(':mandateId', mandateId ?? ''))
  const heading = 'Bizcommunity'

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
      const industryId = await resolveBizCommunityIndustryId(values.industry)
      if (bizJobId) {
        await externalJobsApi.updateBizCommunityJob(
          bizJobId,
          buildUpdateRequest(values, prefill, mandateId, prefill.country_id, industryId),
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
          buildPublishRequest(values, prefill, mandateId, prefill.country_id, industryId),
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
                    options={industries}
                    onChange={(v) => update('industry', v)}
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
                <Field label="Employment Type" required>
                  <SelectInput ariaLabel="Employment Type" value={values.employmentType} options={BIZ_EMPLOYMENT_TYPES} onChange={(v) => update('employmentType', v)} />
                </Field>
              </div>

              <TextAreaField label="Benefits" rows={3} value={values.benefits} onChange={(v) => update('benefits', v)} />
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
              <TextAreaField label="Company Description" rows={3} value={values.clientDescription} onChange={(v) => update('clientDescription', v)} />

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
