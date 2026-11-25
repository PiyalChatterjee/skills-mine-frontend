import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, CircularProgress, Typography } from '@mui/material'
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
  getAdzunaCategoryWarning,
  initialAdzunaFormValues,
  toAdzunaFormValues,
  type AdzunaFormValues,
} from './adzunaFormUtils'
import styles from './AdzunaPostPage.module.css'

/** 55000 → "R 55 000" */
const formatRand = (amount: number | undefined) =>
  typeof amount === 'number' && amount > 0
    ? `R ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
    : ''

const formatRandInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  return digits ? formatRand(Number(digits)) : ''
}

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
  const [loadedAdvertKey, setLoadedAdvertKey] = useState<string>()
  const prefillKey = `${mandateId ?? ''}:${adzunaJobId ?? ''}`
  const isLoading = Boolean(mandateId) && loadedPrefillKey !== prefillKey
  const isEditDataUnavailable = Boolean(adzunaJobId) && loadedAdvertKey !== prefillKey
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false

    void Promise.allSettled([
      adzunaJobId ? Promise.resolve(undefined) : mandateApi.getJobPostDetail(mandateId),
      adzunaJobId
        ? adzunaApi.getAdzunaEditData(adzunaJobId)
        : adzunaApi.getAdzunaPrefill(mandateId),
    ])
      .then(([jobResult, prefillResult]) => {
        if (cancelled) return

        const baseValues = jobResult.status === 'fulfilled' && jobResult.value
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
          const prefilledValues = applyAdzunaPrefill(baseValues, prefillResult.value, Boolean(adzunaJobId))
          setValues(prefilledValues)
          if (adzunaJobId) setLoadedAdvertKey(prefillKey)
          const categoryWarning = getAdzunaCategoryWarning(prefillResult.value.prefill.category, prefilledValues.category)
          const notices = [
            ...prefillResult.value.warnings.filter((warning) =>
              !prefilledValues.companyName.trim() || !/^company is not set\b/i.test(warning),
            ),
            ...prefillResult.value.missing_fields
              .filter((field) => field !== 'category' || !prefilledValues.category)
              .map((field) => `Missing required field: ${field}`),
            ...(categoryWarning ? [categoryWarning] : []),
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
            title: adzunaJobId ? 'Unable to load Adzuna advert' : 'Unable to load Adzuna prefill',
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
    if (isSubmitting || isLoading || isEditDataUnavailable) return
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
      !values.country.trim() && 'Country',
      !ADZUNA_CATEGORIES.some(({ label }) => label === values.category) && 'Adzuna Category',
      !values.description.trim() && 'Job Description',
      !values.requirements.trim() && 'Requirements & Experience',
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

        {isLoading ? (
          <div className={styles.loading} role="status">
            <CircularProgress size={36} aria-label="Loading Adzuna job details" />
            <span>Loading Adzuna job details...</span>
          </div>
        ) : (
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
                    <AzInput value={values.jobLocation} onChange={(e) => update('jobLocation', e.target.value)} />
                  </AzField>
                  <AzField
                    label="Adzuna Category"
                    required
                    hint={prefill.category === 0 && values.category
                      ? 'Adzuna returned an unsupported category. Please review the selected category.'
                      : undefined}
                  >
                    <AzSelect ariaLabel="Adzuna Category" value={values.category} options={ADZUNA_CATEGORIES.map(({ label }) => label)} onChange={(v) => update('category', v)} />
                  </AzField>
                </div>

                <AzField label="Country" required>
                  <AzInput value={values.country} onChange={(e) => update('country', e.target.value)} />
                </AzField>

                <AzField label="Contract Type" group>
                  <AzChipSelect ariaLabel="Add contract type" addLabel="+ Add Type" values={values.contractTypes} options={ADZUNA_CONTRACT_TYPES} onChange={(v) => update('contractTypes', v)} />
                </AzField>

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

            <AzCard title="Adzuna Salary Index & Benchmarking">
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

              </div>
            </AzCard>

            <AzCard title="Role Description & Specifications" aside={<span className={styles.step}>Markdown &amp; Rich Text</span>}>
              <div className={styles.stack}>
                <BizRichText title="Job Description & Duties *" height={113} value={values.description} onChange={(v) => update('description', v)} />
                <BizRichText title="Requirements & Experience *" height={95} value={values.requirements} onChange={(v) => update('requirements', v)} />
                <BizRichText title="Perks & Remuneration Package" height={75} value={values.perks} onChange={(v) => update('perks', v)} />
              </div>
            </AzCard>

            <AzCard title="Search & Publication">
              <div className={styles.stack}>
                  <AzField label="Publication Date">
                    <AzInput type="date" value={values.publicationDate} onChange={(e) => update('publicationDate', e.target.value)} />
                  </AzField>
                  <AzField label="Adzuna Search Keywords / Tags" hint="Separate with commas for semantic aggregation.">
                    <textarea
                      className={styles.keywords}
                      value={values.keywords}
                      onChange={(e) => update('keywords', e.target.value)}
                    />
                  </AzField>
              </div>
            </AzCard>
          </div>

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
              <button type="submit" className={footerStyles.submitBtn} disabled={isLoading || isSubmitting || isEditDataUnavailable}>
                {isSubmitting
                  ? (adzunaJobId ? 'Updating…' : 'Publishing…')
                  : (adzunaJobId ? 'Update on Adzuna' : 'Publish to Adzuna')}
              </button>
            </div>
          </footer>
        </form>
        )}
      </Box>
    </Box>
  )
}

export default AdzunaPostPage
