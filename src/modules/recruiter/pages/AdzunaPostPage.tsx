import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DittoFooter } from '@/modules/recruiter/components/advertised/DittoFooter'
import {
  AzCard,
  AzChipSelect,
  AzField,
  AzInput,
  AzSelect,
} from '@/modules/recruiter/components/advertised/adzuna/AdzunaControls'
import { AzRichText } from '@/modules/recruiter/components/advertised/adzuna/AzRichText'
import {
  ADZUNA_CATEGORIES,
  ADZUNA_CONTRACT_TYPES,
  ADZUNA_EMPLOYMENT_TYPES,
  ADZUNA_SALARY_DISPLAY_OPTIONS,
  ADZUNA_SALARY_FREQUENCIES,
  ADZUNA_SENIORITY_LEVELS,
  ADZUNA_WORKING_MODELS,
  ADZUNA_WORK_FIELDS,
  type AdzunaSalaryDisplay,
} from '@/modules/recruiter/data/adzunaOptions'
import { mandateApi } from '@/services/api/mandateApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { JobPost } from '@/types/api'
import styles from './AdzunaPostPage.module.css'

type AdzunaFormValues = {
  jobTitle: string
  jobLocation: string
  category: string
  workField: string
  contractTypes: string[]
  employmentType: string
  seniority: string
  workingModel: string
  salaryDisplay: AdzunaSalaryDisplay
  currency: string
  minSalary: string
  maxSalary: string
  frequency: string
  applicationUrl: string
  description: string
  requirements: string
  perks: string
  keywords: string
  recruiterName: string
  recruiterEmail: string
  expiryDate: string
}

const initialValues: AdzunaFormValues = {
  jobTitle: '',
  jobLocation: '',
  category: ADZUNA_CATEGORIES[0],
  workField: '',
  contractTypes: [],
  employmentType: '',
  seniority: '',
  workingModel: '',
  salaryDisplay: 'exact',
  currency: 'ZAR (R)',
  minSalary: '',
  maxSalary: '',
  frequency: 'Per Month',
  applicationUrl: '',
  description: '',
  requirements: '',
  perks: '',
  keywords: '',
  recruiterName: '',
  recruiterEmail: '',
  expiryDate: '',
}

const READINESS_SCORE = 96
const READINESS_CHECKS = [
  'Salary benchmark included',
  'Accurate regional geo-tag (JHB)',
  'Target keywords structured',
]

const toBullets = (lines: string[] | undefined) =>
  (lines ?? []).map((line) => `• ${line.replace(/^•\s*/, '')}`).join('\n')

const toDescription = (post: JobPost) => {
  const responsibilities = toBullets(post.responsibilities)
  return [post.jobDescription, responsibilities && `Key Responsibilities:\n${responsibilities}`]
    .filter(Boolean)
    .join('\n\n')
}

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

const toValues = (post: JobPost): AdzunaFormValues => ({
  ...initialValues,
  jobTitle: post.title ?? '',
  jobLocation: post.location ?? '',
  contractTypes: post.employmentType ? [post.employmentType] : [],
  employmentType: post.workType ?? '',
  seniority: post.experienceLevel ?? '',
  minSalary: formatRand(post.salaryMin),
  maxSalary: formatRand(post.salaryMax),
  description: toDescription(post),
  requirements: toBullets(post.requirements),
  perks: toBullets(post.benefits),
  keywords: (post.skills ?? []).join(', '),
  recruiterName: post.contactPersonName ?? '',
  recruiterEmail: post.contactPersonEmail ?? '',
  expiryDate: post.targetCloseDate ? post.targetCloseDate.split('T')[0] : '',
})

const BackArrow = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M10 6H2M5.5 2.5L2 6l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ListIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M4.5 3h5.5M4.5 6h5.5M4.5 9h5.5M2 3h.01M2 6h.01M2 9h.01" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

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

const SendIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <path d="M11 1L1 5.2l3.4 1.4L5.8 10 11 1z" />
  </svg>
)

const AdzunaPostPage = () => {
  usePageTitle('New Job Post — Adzuna')
  const navigate = useNavigate()
  const { mandateId } = useParams<{ mandateId: string }>()
  const [values, setValues] = useState<AdzunaFormValues>(initialValues)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false
    mandateApi
      .getJobPostDetail(mandateId)
      .then((envelope) => {
        if (!cancelled) setValues(toValues(envelope.data))
      })
      .catch(() => {
        // fields stay empty and can be filled in manually
      })
    return () => {
      cancelled = true
    }
  }, [mandateId])

  const update = <K extends keyof AdzunaFormValues>(key: K, value: AdzunaFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const advertiseRoute = ROUTE_PATHS.recruiterAdvertiseJob.replace(':mandateId', mandateId ?? '')
  const handleBack = () => navigate(advertiseRoute)
  const handleSaveDraft = () =>
    setDraftSavedAt(new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false }))

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.topBar}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <button type="button" className={styles.backLink} onClick={handleBack}>
              <BackArrow />
              Back
            </button>
            <span className={styles.crumbSep}>/</span>
            <span>New Job Post</span>
            <span className={styles.crumbSep}>/</span>
            <span>Adzuna South Africa</span>
          </nav>
          <span className={styles.statusPill}>
            <span className={styles.statusDot} />
            Posting to Adzuna
            <span className={styles.indexBadge}>ZA INDEX</span>
          </span>
        </div>

        <section className={styles.platformCard}>
          <span className={styles.platformLogo} aria-hidden="true">Az</span>
          <div className={styles.platformInfo}>
            <h1 className={styles.platformTitle}>
              {values.jobTitle || 'New Job Post'} <span className={styles.titleDash}>—</span>{' '}
              <span className={styles.platformTag}>Adzuna South Africa</span>
            </h1>
            <p className={styles.platformSub}>
              Smart job search engine &amp; salary index for Africa • Ditto Job Publishing System
            </p>
          </div>
          <button type="button" className={styles.backToJobs} onClick={() => navigate(ROUTE_PATHS.recruiterJobPosts)}>
            <ListIcon />
            Back to Jobs
          </button>
        </section>

        <div className={styles.columns}>
          <div className={styles.leftCol}>
            <AzCard title="Position & Classification" aside={<span className={styles.step}>Step 1 of 4</span>}>
              <div className={styles.stack}>
                <AzField label="Job Title" required hint="Include exact seniority and discipline for Adzuna ValueMyCV engine auto-matching.">
                  <AzInput value={values.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
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
                <AzRichText label="Job Description & Duties" required variant="full" height={113} value={values.description} onChange={(v) => update('description', v)} />
                <AzRichText label="Requirements & Experience" required variant="compact" height={95} value={values.requirements} onChange={(v) => update('requirements', v)} />
                <AzRichText label="Perks & Remuneration Package" variant="minimal" height={75} value={values.perks} onChange={(v) => update('perks', v)} />
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

        <div className={styles.actionBar}>
          <div className={styles.actionLeft}>
            <button type="button" className={styles.barBtn} onClick={handleBack}>
              Back
            </button>
            {draftSavedAt && <span className={styles.draftNote}>Draft saved at {draftSavedAt}</span>}
          </div>
          <div className={styles.actionRight}>
            <button type="button" className={styles.barBtn} onClick={handleSaveDraft}>
              Save Draft
            </button>
            <button type="button" className={styles.publishBtn}>
              <SendIcon />
              Publish to Adzuna
            </button>
          </div>
        </div>
      </div>

      <DittoFooter onBack={handleBack} />
    </div>
  )
}

export default AdzunaPostPage
