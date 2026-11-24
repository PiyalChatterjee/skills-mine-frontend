import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { BizRichText } from '@/modules/recruiter/components/advertised/bizcommunity/BizRichText'
import {
  AzCard,
  AzChipSelect,
  AzField,
  AzInput,
  AzSelect,
} from '@/modules/recruiter/components/advertised/adzuna/AdzunaControls'
import pageStyles from './NewMandatePage.module.css'
import footerStyles from '@/modules/recruiter/components/mandate/StickyFooter.module.css'
import {
  ADZUNA_CATEGORIES,
  ADZUNA_CONTRACT_TYPES,
  ADZUNA_EMPLOYMENT_TYPES,
  ADZUNA_SALARY_DISPLAY_OPTIONS,
  ADZUNA_SALARY_FREQUENCIES,
  ADZUNA_SENIORITY_LEVELS,
  ADZUNA_WORKING_MODELS,
  ADZUNA_WORK_FIELDS,
} from '@/modules/recruiter/data/adzunaOptions'
import { adzunaApi, type AdzunaPrefill } from '@/services/api/adzunaApi'
import { mandateApi } from '@/services/api/mandateApi'
import { extractErrorMessage } from '@/app/errorUtils'
import { pushNotification } from '@/store/slices/notificationSlice'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { usePageTitle } from '@/hooks/usePageTitle'
import {
  applyAdzunaPrefill,
  buildAdzunaPublishRequest,
  initialAdzunaFormValues,
  toAdzunaFormValues,
  type AdzunaFormValues,
} from './adzunaFormUtils'
import styles from './AdzunaPostPage.module.css'

const READINESS_SCORE = 96
const READINESS_CHECKS = [
  'Salary benchmark included',
  'Accurate regional geo-tag (JHB)',
  'Target keywords structured',
]

/** 55000 → "R 55 000" */
const formatRand = (amount: number | undefined) =>
  typeof amount === 'number' && amount > 0
    ? `R ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
    : ''

const formatRandInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  return digits ? formatRand(Number(digits)) : ''
}

const toDisplayDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}

const PinIcon = () => (
  <svg className={styles.pinIcon} width="11" height="11" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M6 .8a3.6 3.6 0 00-3.6 3.6C2.4 7 6 11.2 6 11.2s3.6-4.2 3.6-6.8A3.6 3.6 0 006 .8zm0 5a1.4 1.4 0 110-2.8 1.4 1.4 0 010 2.8z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className={styles.calendarIcon} width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.1" />
    <path d="M1.5 5h9M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

const CheckBadge = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="7" cy="7" r="7" fill="currentColor" />
    <path d="M4 7.2l2 2 4-4.2" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const AdzunaPostPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const locationState = location.state as { adzunaJobId?: string } | null
  const adzunaJobId = searchParams.get('adzunaJobId') || locationState?.adzunaJobId
  usePageTitle(adzunaJobId ? 'Edit Job Post — Adzuna' : 'New Job Post — Adzuna')
  const dispatch = useDispatch()
  const { mandateId } = useParams<{ mandateId: string }>()
  const [values, setValues] = useState<AdzunaFormValues>(initialAdzunaFormValues)
  const [prefill, setPrefill] = useState<AdzunaPrefill>({})
  const [loadedPrefillKey, setLoadedPrefillKey] = useState<string>()
  const prefillKey = `${mandateId ?? ''}:${adzunaJobId ?? ''}`
  const isLoading = Boolean(mandateId) && loadedPrefillKey !== prefillKey
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false

    void Promise.allSettled([
      mandateApi.getJobPostDetail(mandateId),
      adzunaApi.getAdzunaPrefill(mandateId),
    ])
      .then(([jobResult, prefillResult]) => {
        if (cancelled) return

        const baseValues = jobResult.status === 'fulfilled'
          ? toAdzunaFormValues(jobResult.value.data)
          : initialAdzunaFormValues
        if (jobResult.status === 'rejected') {
          dispatch(pushNotification({
            level: 'error',
            title: 'Unable to load job details',
            message: extractErrorMessage(jobResult.reason, 'Could not load the job profile.'),
          }))
        }

        if (prefillResult.status === 'fulfilled') {
          setPrefill(prefillResult.value.prefill)
          const prefilledValues = applyAdzunaPrefill(baseValues, prefillResult.value)
          setValues(prefilledValues)
          const notices = [
            ...prefillResult.value.warnings.filter((warning) =>
              !prefilledValues.companyName.trim() || !/^company is not set\b/i.test(warning),
            ),
            ...prefillResult.value.missing_fields.map((field) => `Missing required field: ${field}`),
          ]
          if (notices.length > 0) {
            dispatch(pushNotification({
              level: 'warning',
              title: 'Review Adzuna job details',
              message: notices.join(' '),
            }))
          }
        } else {
          setValues(baseValues)
          setPrefill({})
          dispatch(pushNotification({
            level: 'error',
            title: 'Unable to load Adzuna prefill',
            message: extractErrorMessage(prefillResult.reason, 'Could not load Adzuna job details.'),
          }))
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedPrefillKey(prefillKey)
      })

    return () => {
      cancelled = true
    }
  }, [adzunaJobId, dispatch, mandateId, prefillKey])

  const update = <K extends keyof AdzunaFormValues>(key: K, value: AdzunaFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleBack = () => navigate(-1)
  const handleSaveDraft = () =>
    setDraftSavedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (isSubmitting || isLoading) return
    if (!mandateId) {
      dispatch(pushNotification({
        level: 'error',
        title: 'Cannot publish to Adzuna',
        message: 'A job profile could not be resolved.',
      }))
      return
    }

    const missingFields = [
      !values.jobTitle.trim() && 'Job Title',
      !values.jobLocation.trim() && 'Job Location',
      !values.category.trim() && 'Adzuna Category',
      !values.description.trim() && 'Job Description',
      !values.requirements.trim() && 'Requirements & Experience',
      !values.recruiterEmail.trim() && 'Recruiter Email',
    ].filter(Boolean)
    if (missingFields.length > 0) {
      dispatch(pushNotification({
        level: 'error',
        title: 'Complete required Adzuna fields',
        message: `Required fields: ${missingFields.join(', ')}.`,
      }))
      return
    }

    setIsSubmitting(true)
    try {
      const jobProfileUrl = `${window.location.origin}${ROUTE_PATHS.jobDetails.replace(':jobId', mandateId)}`
      const request = buildAdzunaPublishRequest(
        values,
        prefill,
        mandateId,
        jobProfileUrl,
        adzunaJobId,
      )
      if (adzunaJobId) {
        await adzunaApi.updateAdzunaJob(adzunaJobId, request)
        dispatch(pushNotification({
          level: 'success',
          title: 'Updated on Adzuna',
          message: `"${values.jobTitle}" has been updated on Adzuna.`,
        }))
      } else {
        await adzunaApi.publishToAdzuna(request)
        dispatch(pushNotification({
          level: 'success',
          title: 'Published to Adzuna',
          message: `"${values.jobTitle}" has been published to Adzuna.`,
        }))
      }
      navigate(ROUTE_PATHS.recruiterAdvertisedJobs)
    } catch (error) {
      dispatch(pushNotification({
        level: 'error',
        title: adzunaJobId ? 'Update failed' : 'Publish failed',
        message: extractErrorMessage(
          error,
          adzunaJobId
            ? 'Could not update the job on Adzuna. Please try again.'
            : 'Could not publish the job to Adzuna. Please try again.',
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
            Adzuna South Africa
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} noValidate>
          <Box className={pageStyles.card}>
            <div className={styles.columns}>
          <div className={styles.leftCol}>
            <AzCard title="Position & Classification">
              <div className={styles.stack}>
                <AzField label="Job Title" required hint="Include exact seniority and discipline for Adzuna ValueMyCV engine auto-matching.">
                  <AzInput value={values.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
                </AzField>

                <AzField label="Company Name" hint="Highly preferred by Adzuna. Prefilled from job details when available.">
                  <AzInput value={values.companyName} onChange={(e) => update('companyName', e.target.value)} />
                </AzField>

                <div className={styles.rowTwo}>
                  <AzField label="Job Location" required>
                    <span className={styles.iconWrap}>
                      <PinIcon />
                      <AzInput className={styles.withIcon} value={values.jobLocation} onChange={(e) => update('jobLocation', e.target.value)} />
                    </span>
                  </AzField>
                  <AzField label="Adzuna Category" required>
                    <AzSelect ariaLabel="Adzuna Category" value={values.category} options={ADZUNA_CATEGORIES} onChange={(v) => update('category', v)} />
                  </AzField>
                </div>

                <div className={styles.rowTwo}>
                  <AzField label="Work Field">
                    <AzSelect ariaLabel="Work Field" value={values.workField} options={ADZUNA_WORK_FIELDS} onChange={(v) => update('workField', v)} />
                  </AzField>
                  <AzField label="Contract Type" group>
                    <AzChipSelect ariaLabel="Add contract type" addLabel="+ Add Type" values={values.contractTypes} options={ADZUNA_CONTRACT_TYPES} onChange={(v) => update('contractTypes', v)} />
                  </AzField>
                </div>

                <div className={styles.rowThree}>
                  <AzField label="Employment Type">
                    <AzSelect ariaLabel="Employment Type" value={values.employmentType} options={ADZUNA_EMPLOYMENT_TYPES} onChange={(v) => update('employmentType', v)} />
                  </AzField>
                  <AzField label="Seniority Level">
                    <AzSelect ariaLabel="Seniority Level" value={values.seniority} options={ADZUNA_SENIORITY_LEVELS} onChange={(v) => update('seniority', v)} />
                  </AzField>
                  <AzField label="Working Model">
                    <AzSelect ariaLabel="Working Model" value={values.workingModel} options={ADZUNA_WORKING_MODELS} onChange={(v) => update('workingModel', v)} />
                  </AzField>
                </div>
              </div>
            </AzCard>

            <AzCard title="Adzuna Salary Index & Benchmarking" aside={<span className={styles.certified}>ValueMyCV Certified</span>}>
              <div className={styles.stack}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel} id="az-salary-display">Salary Display Preference</span>
                  <div className={styles.radioRow} role="radiogroup" aria-labelledby="az-salary-display">
                    {ADZUNA_SALARY_DISPLAY_OPTIONS.map(({ value, label }) => {
                      const checked = values.salaryDisplay === value
                      return (
                        <label key={value} className={`${styles.radioCard} ${checked ? styles.radioCardActive : ''}`}>
                          <input
                            type="radio"
                            name="az-salary-display"
                            className={styles.radioNative}
                            checked={checked}
                            onChange={() => update('salaryDisplay', value)}
                          />
                          <span className={`${styles.radioDot} ${checked ? styles.radioDotActive : ''}`} aria-hidden="true" />
                          {label}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.salaryRow}>
                  <AzField label="Currency">
                    <AzInput className={styles.readonlyInput} readOnly value={values.currency} />
                  </AzField>
                  <AzField label="Minimum Salary">
                    <AzInput value={values.minSalary} onChange={(e) => update('minSalary', formatRandInput(e.target.value))} />
                  </AzField>
                  <AzField label="Maximum Salary">
                    <AzInput value={values.maxSalary} onChange={(e) => update('maxSalary', formatRandInput(e.target.value))} />
                  </AzField>
                  <AzField label="Frequency">
                    <AzSelect ariaLabel="Frequency" value={values.frequency} options={ADZUNA_SALARY_FREQUENCIES} onChange={(v) => update('frequency', v)} />
                  </AzField>
                </div>

                <div className={styles.benchmark} role="status">
                  <span className={styles.benchmarkIcon}><CheckBadge size={18} /></span>
                  <div>
                    <p className={styles.benchmarkTitle}>
                      Your salary range aligns with the top 15% Johannesburg Finance benchmark (R58 000 avg).
                    </p>
                    <p className={styles.benchmarkSub}>
                      Postings with indexed salary indicators receive up to 2.4x more qualified applicants on Adzuna.
                    </p>
                  </div>
                </div>

                <AzField label="Direct Application URL (Optional ATS Redirect)">
                  <AzInput
                    className={styles.urlInput}
                    placeholder="https://careers.theskillsmine.com/apply/funding-spec-jhb"
                    value={values.applicationUrl}
                    onChange={(e) => update('applicationUrl', e.target.value)}
                  />
                </AzField>
              </div>
            </AzCard>

            <AzCard title="Role Description & Specifications" aside={<span className={styles.step}>Markdown &amp; Rich Text</span>}>
              <div className={styles.stack}>
                <BizRichText title="Job Description & Duties *" height={113} value={values.description} onChange={(v) => update('description', v)} />
                <BizRichText title="Requirements & Experience *" height={95} value={values.requirements} onChange={(v) => update('requirements', v)} />
                <BizRichText title="Perks & Remuneration Package" height={75} value={values.perks} onChange={(v) => update('perks', v)} />
              </div>
            </AzCard>

            <AzCard title="Search & Expiry Control">
              <div className={styles.stack}>
                  <AzField label="Adzuna Search Keywords / Tags" hint="Separate with commas for semantic aggregation.">
                    <textarea
                      className={styles.keywords}
                      value={values.keywords}
                      onChange={(e) => update('keywords', e.target.value)}
                    />
                  </AzField>
                  <AzField label="Primary Recruiter Contact">
                    <AzInput className={styles.sideInput} value={values.recruiterName} onChange={(e) => update('recruiterName', e.target.value)} />
                  </AzField>
                  <AzField label="Recruiter Email" required>
                    <AzInput className={styles.sideInput} type="email" value={values.recruiterEmail} onChange={(e) => update('recruiterEmail', e.target.value)} />
                  </AzField>
                  <AzField label="Listing Expiry Date" hint="Adzuna listing renewal happens every 30 days automatically.">
                    <span className={styles.iconWrap}>
                      <CalendarIcon />
                      <AzInput className={`${styles.sideInput} ${styles.withIcon}`} readOnly value={toDisplayDate(values.expiryDate)} aria-label="Listing Expiry Date" />
                      <input
                        type="date"
                        className={styles.dateNative}
                        aria-label="Pick listing expiry date"
                        value={values.expiryDate}
                        onChange={(e) => update('expiryDate', e.target.value)}
                      />
                    </span>
                  </AzField>
              </div>
            </AzCard>
          </div>

          <aside className={styles.rightCol}>
            <section className={styles.sideCard}>
              <h2 className={styles.sideTitle}>Publishing Readiness</h2>
              <div className={styles.indexRow}>
                <span>Adzuna Quality Index</span>
                <span className={styles.indexScore}>{READINESS_SCORE}% (High)</span>
              </div>
              <div
                className={styles.progress}
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={READINESS_SCORE}
                aria-label="Adzuna Quality Index"
              >
                <span className={styles.progressFill} style={{ width: `${READINESS_SCORE}%` }} />
              </div>
              <ul className={styles.checklist}>
                {READINESS_CHECKS.map((item) => (
                  <li key={item} className={styles.checkItem}>
                    <CheckBadge />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.synergy}>
              <span className={styles.synergyLogo} aria-hidden="true">Az</span>
              <div>
                <h2 className={styles.synergyTitle}>Adzuna ValueMyCV Synergy</h2>
                <p className={styles.synergyText}>
                  When published, this opening is distributed to over 450,000 active South African financial sector
                  candidates searching on Adzuna.co.za.
                </p>
              </div>
            </section>
          </aside>
            </div>
          </Box>
          <footer className={footerStyles.footer}>
            <div className={styles.footerContent}>
              <div className={styles.actionLeft}>
                {draftSavedAt && <span className={styles.draftNote}>Draft saved at {draftSavedAt}</span>}
                <button type="button" className={footerStyles.cancelBtn} onClick={handleSaveDraft}>
                  Save Draft
                </button>
              </div>
              <button type="submit" className={footerStyles.submitBtn} disabled={isLoading || isSubmitting}>
                {isSubmitting
                  ? (adzunaJobId ? 'Updating…' : 'Publishing…')
                  : (adzunaJobId ? 'Update on Adzuna' : 'Publish to Adzuna')}
              </button>
            </div>
          </footer>
        </form>
      </Box>
    </Box>
  )
}

export default AdzunaPostPage
