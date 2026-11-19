import { useEffect, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { StickyFooter } from '@/modules/recruiter/components/mandate/StickyFooter'
import {
  PNET_CONTRACT_TYPES,
  PNET_EXPERIENCE,
  PNET_LOCATIONS,
  PNET_SECTORS,
  PNET_SITUATION_TYPES,
  PNET_WORK_FIELDS,
  PNET_WORK_TYPES,
} from '@/modules/recruiter/data/pnetOptions'
import {
  externalJobsApi,
  type PnetAction,
  type PnetApply,
  type PnetCategorization,
  type PnetChannel,
  type PnetFieldKey,
  type PnetFields,
  type PnetIdBasedFields,
  type PnetPrefill,
  type PnetPrefillResponse,
  type PublishPnetJobRequest,
} from '@/services/api/externalJobsApi'
import { extractErrorMessage } from '@/app/errorUtils'
import { pushNotification } from '@/store/slices/notificationSlice'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import pageStyles from './NewMandatePage.module.css'
import formStyles from '@/modules/recruiter/components/mandate/form.module.css'
import styles from './PnetPostPage.module.css'

type PnetFormValues = {
  jobTitle: string
  jobLocation: string
  vacancies: string
  location: string
  workField: string
  sectors: string[]
  contractTypes: string[]
  workType: string
  experience: string
  situationType: string
  salary: string
  description: string
  candidateProfile: string
  offerDescription: string
  keywords: string
  contactName: string
  contactEmail: string
  expiryDate: string
  clientDescription: string
}

const initialValues: PnetFormValues = {
  jobTitle: '',
  jobLocation: '',
  vacancies: '1',
  location: '',
  workField: '',
  sectors: [],
  contractTypes: [],
  workType: '',
  experience: '',
  situationType: '',
  salary: 'Market Related',
  description: '',
  candidateProfile: '',
  offerDescription: '',
  keywords: '',
  contactName: '',
  contactEmail: '',
  expiryDate: '',
  clientDescription: '',
}

type PnetOptions = Record<PnetFieldKey, string[]>

const DEFAULT_OPTIONS: PnetOptions = {
  workfield: PNET_WORK_FIELDS,
  geography: PNET_LOCATIONS,
  sector: PNET_SECTORS,
  contracttype: PNET_CONTRACT_TYPES,
  worktype: PNET_WORK_TYPES,
  experience: PNET_EXPERIENCE,
  situation: PNET_SITUATION_TYPES,
}

// Dropdown options come from the prefill response (`pnetFields`); the static
// lists are only a fallback when the API does not return a given list.
const buildOptions = (fields?: PnetFields): PnetOptions => {
  const options = { ...DEFAULT_OPTIONS }
  ;(Object.keys(options) as PnetFieldKey[]).forEach((key) => {
    const names = fields?.[key]?.map((option) => option.name)
    if (names?.length) options[key] = names
  })
  return options
}

// StepStone/PNet codes returned by the prefill endpoint -> option names.
const PNET_EXPERIENCE_LABELS: Record<string, string> = {
  WithProfessionalExperience: 'Experience required',
  WithoutProfessionalExperience: 'No Experience/ First Jobs',
}

const PNET_WORK_POLICY_LABELS: Record<string, string> = {
  Remote: 'Work From Home',
}

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const findOption = (options: string[], value?: string) =>
  value ? options.find((option) => normalise(option) === normalise(value)) : undefined

// Overlays the PNet prefill on the form values. Only fields the API actually
// returned (and that exist in the PNet option lists) are applied; everything
// else keeps its default.
const applyPrefill = (
  base: PnetFormValues,
  { prefill, pnetFields }: PnetPrefillResponse,
  options: PnetOptions,
): PnetFormValues => {
  const next = { ...base }
  const details = prefill.jobdetails
  const categorization = prefill.categorization
  const recruiter = prefill.companydetails?.recruiter

  // idFields carries the PNet option id (0 = not set); it wins over name matching.
  const nameById = (key: PnetFieldKey) => {
    const id = prefill.idFields?.[key]
    return id ? pnetFields?.[key]?.find((option) => option.id === id)?.name : undefined
  }
  const resolve = (key: PnetFieldKey, ...candidates: (string | undefined)[]) =>
    nameById(key) ??
    candidates.map((candidate) => findOption(options[key], candidate)).find(Boolean)

  if (details?.jobtitle) next.jobTitle = details.jobtitle
  if (details?.introduction) next.clientDescription = details.introduction
  if (details?.tasks) next.description = details.tasks
  if (details?.profile) next.candidateProfile = details.profile
  if (details?.offer) next.offerDescription = details.offer.replace(/\\n/g, '\n')
  if (details?.keywords) next.keywords = details.keywords

  const city = details?.joblocations?.[0]?.city
  if (city) next.jobLocation = city
  const location = resolve('geography', city)
  if (location) next.location = location

  const workField = nameById('workfield')
  if (workField) next.workField = workField
  const sector = nameById('sector')
  if (sector) next.sectors = [sector]
  const situation = nameById('situation')
  if (situation) next.situationType = situation

  const { minimum, maximum, currency, period } = details?.salary ?? {}
  if (minimum != null && maximum != null) {
    next.salary = [
      currency,
      `${minimum.toLocaleString()} - ${maximum.toLocaleString()}`,
      period && `(${period})`,
    ]
      .filter(Boolean)
      .join(' ')
  }

  const experienceCode = categorization?.experience?.[0]
  const experience = resolve(
    'experience',
    experienceCode && (PNET_EXPERIENCE_LABELS[experienceCode] ?? experienceCode),
  )
  if (experience) next.experience = experience

  const contractTypes = [
    nameById('contracttype'),
    ...(categorization?.contracttype ?? []).map((code) => findOption(options.contracttype, code)),
  ].filter((name, index, all): name is string => !!name && all.indexOf(name) === index)
  if (contractTypes.length) next.contractTypes = contractTypes

  const workPolicy = categorization?.workpolicy?.[0]
  const workType = resolve(
    'worktype',
    categorization?.contractime?.[0],
    workPolicy,
    workPolicy && PNET_WORK_POLICY_LABELS[workPolicy],
  )
  if (workType) next.workType = workType

  const contactName = [recruiter?.firstname, recruiter?.lastname].filter(Boolean).join(' ')
  if (contactName) next.contactName = contactName
  if (recruiter?.email) next.contactEmail = recruiter.email
  return next
}

const isFilled = (value: string) => value.trim().length > 0

const resolveFieldId = (
  key: PnetFieldKey,
  selectedName: string | undefined,
  pnetFields?: PnetFields,
  prefill?: PnetPrefill,
): number => {
  if (selectedName && pnetFields?.[key]) {
    const found = pnetFields[key]?.find(
      (opt) => normalise(opt.name) === normalise(selectedName) || opt.name === selectedName,
    )
    if (found && typeof found.id === 'number') return found.id
  }
  if (prefill?.idFields?.[key] && typeof prefill.idFields[key] === 'number') {
    return prefill.idFields[key]!
  }
  if (pnetFields?.[key]?.[0]?.id) {
    return pnetFields[key]![0].id
  }
  return 0
}

const PNET_EXPERIENCE_CODES: Record<string, string> = {
  'Experience required': 'WithProfessionalExperience',
  'No Experience/ First Jobs': 'WithoutProfessionalExperience',
  'No experience required': 'WithoutProfessionalExperience',
}

const buildPublishRequest = (
  values: PnetFormValues,
  prefill: PnetPrefill,
  pnetFields: PnetFields | undefined,
  jobProfileId: string,
): PublishPnetJobRequest => {
  const referenceId = prefill.reference_id || jobProfileId

  const nameParts = values.contactName.trim().split(/\s+/)
  const firstname = nameParts[0] || prefill.companydetails?.recruiter?.firstname || ''
  const lastname = nameParts.slice(1).join(' ') || prefill.companydetails?.recruiter?.lastname || ''

  const city = values.jobLocation.trim() || prefill.jobdetails?.joblocations?.[0]?.city || ''
  const countrycode = prefill.jobdetails?.joblocations?.[0]?.countrycode || 'ZA'

  const contactEmail = values.contactEmail.trim()
  const apply: PnetApply = prefill.jobdetails?.apply?.url
    ? { url: prefill.jobdetails.apply.url }
    : contactEmail
      ? { email: contactEmail }
      : prefill.jobdetails?.apply?.email
        ? { email: prefill.jobdetails.apply.email }
        : {}

  const idFields: PnetIdBasedFields = {
    workfield: resolveFieldId('workfield', values.workField, pnetFields, prefill),
    geography: resolveFieldId('geography', values.location || values.jobLocation, pnetFields, prefill),
    sector: resolveFieldId('sector', values.sectors[0], pnetFields, prefill),
    contracttype: resolveFieldId('contracttype', values.contractTypes[0], pnetFields, prefill),
    worktype: resolveFieldId('worktype', values.workType, pnetFields, prefill),
    experience: resolveFieldId('experience', values.experience, pnetFields, prefill),
    situation: resolveFieldId('situation', values.situationType, pnetFields, prefill),
  }

  const categorization: PnetCategorization = {
    experience: values.experience
      ? [PNET_EXPERIENCE_CODES[values.experience] ?? values.experience]
      : (prefill.categorization?.experience ?? ['WithProfessionalExperience']),
    contracttype: values.contractTypes.length
      ? values.contractTypes
      : (prefill.categorization?.contracttype ?? ['Permanent']),
    workpolicy: values.workType
      ? [values.workType === 'Work From Home' ? 'Remote' : values.workType]
      : (prefill.categorization?.workpolicy ?? ['Hybrid']),
  }

  const introduction =
    values.clientDescription.trim() ||
    prefill.jobdetails?.introduction ||
    ''

  const tasks = values.description.trim() || prefill.jobdetails?.tasks || ''
  const profile =
    values.candidateProfile.trim() ||
    prefill.jobdetails?.profile ||
    ''

  const offer = values.offerDescription.trim() || prefill.jobdetails?.offer || ''
  const keywords = values.keywords.trim() || prefill.jobdetails?.keywords || undefined

  const request: PublishPnetJobRequest = {
    reference_id: referenceId,
    action: (prefill.action as PnetAction) || 'INSERT',
    channel: (prefill.channel as PnetChannel) || 'ZA',
    idFields,
    listingtype: prefill.listingtype || 'Standard',
    categorization,
    jobdetails: {
      language: prefill.jobdetails?.language || 'EN',
      jobtitle: values.jobTitle.trim().slice(0, 200),
      introduction,
      tasks,
      profile,
      offer,
      joblocations: [{ countrycode, city }],
      ...(keywords ? { keywords } : {}),
      apply,
      salary: prefill.jobdetails?.salary,
    },
    companydetails: {
      companyname: prefill.companydetails?.companyname || 'SkillsMine',
      recruiter: {
        firstname: firstname || prefill.companydetails?.recruiter?.firstname || '',
        lastname: lastname || prefill.companydetails?.recruiter?.lastname || '',
        email: contactEmail || prefill.companydetails?.recruiter?.email || '',
      },
    },
    job_profile_id_ref: prefill.job_profile_id_ref || referenceId,
  }

  return request
}

// ── Field helpers (use the mandate/BizCommunity form styles) ───────────────

const Field = ({
  label,
  required,
  note,
  children,
}: {
  label: string
  required?: boolean
  note?: string
  children: ReactNode
}) => (
  <div className={formStyles.field}>
    <label className={formStyles.label}>
      {label}
      {required && ' *'}
    </label>
    {children}
    {note && <p className={styles.note}>{note}</p>}
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

const SelectInput = ({
  ariaLabel,
  value,
  options,
  onChange,
  placeholder = 'Select',
  disabled,
}: SelectInputProps) => {
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

type ChipSelectProps = {
  ariaLabel: string
  values: string[]
  options: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

const ChipSelect = ({
  ariaLabel,
  values,
  options,
  onChange,
  placeholder = 'Select...',
}: ChipSelectProps) => {
  const remaining = options.filter((opt) => !values.includes(opt))
  return (
    <div className={styles.chipBox}>
      <div className={styles.chipList}>
        {values.map((val) => (
          <span key={val} className={styles.chip}>
            {val}
            <button
              type="button"
              className={styles.chipRemove}
              aria-label={`Remove ${val}`}
              onClick={() => onChange(values.filter((item) => item !== val))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {remaining.length > 0 && (
        <div className={styles.chipSelectWrap}>
          <select
            aria-label={ariaLabel}
            className={styles.chipSelect}
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onChange([...values, e.target.value])
              }
            }}
          >
            <option value="">{values.length === 0 ? placeholder : '+ Add more'}</option>
            {remaining.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

const RichTextAreaField = ({
  label,
  value,
  rows = 5,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  rows?: number
  placeholder?: string
  onChange: (value: string) => void
}) => (
  <div className={formStyles.field}>
    <label className={formStyles.label}>{label}</label>
    <div className={styles.richEditor}>
      <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`}>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolBtn} aria-label="Undo" title="Undo">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5.5h5.5a3 3 0 010 6H5M3 5.5L5.5 3M3 5.5L5.5 8" />
            </svg>
          </button>
          <button type="button" className={styles.toolBtn} aria-label="Redo" title="Redo">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5.5H5.5a3 3 0 000 6H9M11 5.5L8.5 3M11 5.5L8.5 8" />
            </svg>
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolBtn} aria-label="Bold" title="Bold">
            <span style={{ fontWeight: 700, fontSize: 13 }}>B</span>
          </button>
          <button type="button" className={styles.toolBtn} aria-label="Italic" title="Italic">
            <span style={{ fontStyle: 'italic', fontFamily: 'serif', fontWeight: 600, fontSize: 13 }}>I</span>
          </button>
          <button type="button" className={styles.toolBtn} aria-label="Link" title="Link">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8.3a2.4 2.4 0 003.4 0l2-2a2.4 2.4 0 00-3.4-3.4l-.7.7M8 5.7a2.4 2.4 0 00-3.4 0l-2 2a2.4 2.4 0 003.4 3.4l.7-.7" />
            </svg>
          </button>
          <button type="button" className={styles.toolBtn} aria-label="Strikethrough" title="Strikethrough">
            <span style={{ textDecoration: 'line-through', fontSize: 12 }}>S</span>
          </button>
          <button type="button" className={styles.toolBtn} aria-label="Bulleted list" title="Bulleted list">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5.5 4h6M5.5 7h6M5.5 10h6M2.5 4h.01M2.5 7h.01M2.5 10h.01" />
            </svg>
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolBtn} aria-label="Decrease indent" title="Decrease indent">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h10M7 6h5M7 8h5M2 11h10M5 5.2L2.6 7 5 8.8" />
            </svg>
          </button>
          <button type="button" className={styles.toolBtn} aria-label="Increase indent" title="Increase indent">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h10M7 6h5M7 8h5M2 11h10M2.6 5.2L5 7 2.6 8.8" />
            </svg>
          </button>
        </div>
        <div className={styles.toolbarGroup}>
          <button type="button" className={styles.toolBtn} aria-label="Text size" title="Text size" style={{ width: 'auto', padding: '0 4px', fontSize: 12, fontWeight: 600 }}>
            Aa ▾
          </button>
        </div>
      </div>
      <textarea
        aria-label={label}
        className={styles.richTextarea}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </div>
)

const PnetPostPage = () => {
  usePageTitle('New Job Post — pNet')
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { mandateId } = useParams<{ mandateId: string }>()

  const [values, setValues] = useState<PnetFormValues>(initialValues)
  const [options, setOptions] = useState<PnetOptions>(DEFAULT_OPTIONS)
  const [prefill, setPrefill] = useState<PnetPrefill>({})
  const [pnetFields, setPnetFields] = useState<PnetFields | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notices, setNotices] = useState<string[]>([])

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false
    externalJobsApi
      .getPnetPrefill(mandateId)
      .then((response) => {
        if (cancelled) return
        setPrefill(response.prefill)
        setPnetFields(response.pnetFields)
        const responseOptions = buildOptions(response.pnetFields)
        setOptions(responseOptions)
        setValues(applyPrefill(initialValues, response, responseOptions))
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
  }, [mandateId])

  const update = <K extends keyof PnetFormValues>(key: K, value: PnetFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleBack = () => navigate(ROUTE_PATHS.recruiterAdvertiseJob.replace(':mandateId', mandateId ?? ''))
  const heading = 'PNet'

  const isValid =
    isFilled(values.jobTitle) &&
    isFilled(values.jobLocation) &&
    isFilled(values.contactEmail) &&
    isFilled(values.description)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!mandateId || !isValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = buildPublishRequest(values, prefill, pnetFields, mandateId)
      await externalJobsApi.publishToPnet(payload)
      dispatch(
        pushNotification({
          level: 'success',
          title: 'Published to PNet',
          message: `"${values.jobTitle}" has been published to PNet.`,
        }),
      )
      navigate(ROUTE_PATHS.recruiterAdvertisedJobs, {
        state: {
          platformName: 'PNet',
          bannerMessage: `Job "${values.jobTitle}" successfully published to PNet.`,
        },
      })
    } catch (error) {
      dispatch(
        pushNotification({
          level: 'error',
          title: 'Publish failed',
          message: extractErrorMessage(
            error,
            'Could not publish the job to PNet. Please try again.',
          ),
        }),
      )
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
                <Field label="Job Title" required note="Please do not include locations in job titles">
                  <TextInput
                    placeholder="Job Title"
                    value={values.jobTitle}
                    onChange={(e) => update('jobTitle', e.target.value)}
                  />
                </Field>
                <Field label="Job Location" required>
                  <TextInput
                    placeholder="Job Location"
                    value={values.jobLocation}
                    onChange={(e) => update('jobLocation', e.target.value)}
                  />
                </Field>
                <Field label="Number of Vacancies">
                  <TextInput
                    type="number"
                    min={1}
                    placeholder="1"
                    value={values.vacancies}
                    onChange={(e) => update('vacancies', e.target.value)}
                  />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Locations">
                  <SelectInput
                    ariaLabel="Locations"
                    value={values.location}
                    options={options.geography}
                    onChange={(v) => update('location', v)}
                    placeholder="Select location"
                  />
                </Field>
                <Field label="Work Field">
                  <SelectInput
                    ariaLabel="Work Field"
                    value={values.workField}
                    options={options.workfield}
                    onChange={(v) => update('workField', v)}
                    placeholder="Select work field"
                  />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Sector">
                  <ChipSelect
                    ariaLabel="Sector"
                    values={values.sectors}
                    options={options.sector}
                    onChange={(v) => update('sectors', v)}
                    placeholder="Select sectors"
                  />
                </Field>
                <Field label="Contract Type">
                  <ChipSelect
                    ariaLabel="Contract Type"
                    values={values.contractTypes}
                    options={options.contracttype}
                    onChange={(v) => update('contractTypes', v)}
                    placeholder="Select contract types"
                  />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Work Type">
                  <SelectInput
                    ariaLabel="Work Type"
                    value={values.workType}
                    options={options.worktype}
                    onChange={(v) => update('workType', v)}
                    placeholder="Select work type"
                  />
                </Field>
                <Field label="Experience">
                  <SelectInput
                    ariaLabel="Experience"
                    value={values.experience}
                    options={options.experience}
                    onChange={(v) => update('experience', v)}
                    placeholder="Select experience"
                  />
                </Field>
              </div>

              <div className={formStyles.row}>
                <Field label="Situation Type">
                  <SelectInput
                    ariaLabel="Situation Type"
                    value={values.situationType}
                    options={options.situation}
                    onChange={(v) => update('situationType', v)}
                    placeholder="Select situation"
                  />
                </Field>
                <Field label="Salary">
                  <TextInput
                    placeholder="Market Related"
                    value={values.salary}
                    onChange={(e) => update('salary', e.target.value)}
                  />
                </Field>
              </div>
            </section>

            {/* ── Job Description ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Job Description</h2>
              <RichTextAreaField
                label="Job Description"
                rows={8}
                value={values.description}
                onChange={(v) => update('description', v)}
              />
            </section>

            {/* ── Candidate Profile ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Candidate Profile</h2>
              <RichTextAreaField
                label="Candidate Profile"
                rows={4}
                placeholder="Describe the ideal candidate"
                value={values.candidateProfile}
                onChange={(v) => update('candidateProfile', v)}
              />
            </section>

            {/* ── Offer Description ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Offer Description</h2>
              <RichTextAreaField
                label="Offer Description"
                rows={4}
                placeholder="Describe the offer and benefits"
                value={values.offerDescription}
                onChange={(v) => update('offerDescription', v)}
              />
            </section>

            {/* ── Contact Details & Keywords ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Contact & Matching Details</h2>

              <Field label="Keywords" note="Add keywords for better matching">
                <TextInput
                  placeholder="e.g. Banking, Debt Collection, Salesforce, Excel"
                  value={values.keywords}
                  onChange={(e) => update('keywords', e.target.value)}
                />
              </Field>

              <div className={styles.rowThree}>
                <Field label="Contact Name">
                  <TextInput
                    placeholder="Contact Name"
                    value={values.contactName}
                    onChange={(e) => update('contactName', e.target.value)}
                  />
                </Field>
                <Field label="Contact Email" required>
                  <TextInput
                    type="email"
                    placeholder="Contact Email"
                    value={values.contactEmail}
                    onChange={(e) => update('contactEmail', e.target.value)}
                  />
                </Field>
                <Field
                  label="Expiry Date"
                  note="Ditto expiry date. PNET listing duration is controlled separately by PNET."
                >
                  <TextInput
                    type="date"
                    aria-label="Expiry Date"
                    value={values.expiryDate}
                    onChange={(e) => update('expiryDate', e.target.value)}
                  />
                </Field>
              </div>
            </section>

            {/* ── Company Description ── */}
            <section className={formStyles.section}>
              <h2 className={formStyles.sectionTitle}>Company Information</h2>
              <RichTextAreaField
                label="Company Description"
                rows={4}
                placeholder="Our client is in the Financial Services industry."
                value={values.clientDescription}
                onChange={(v) => update('clientDescription', v)}
              />
            </section>
          </Box>

          <StickyFooter
            isSubmitting={isSubmitting}
            submitLabel="Publish to PNet"
            isValid={isValid}
          />
        </form>
      </Box>
    </Box>
  )
}

export default PnetPostPage
