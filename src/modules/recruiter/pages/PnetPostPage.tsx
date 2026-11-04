import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DittoFooter } from '@/modules/recruiter/components/advertised/DittoFooter'
import { Field, TextInput, SelectField, ChipSelect } from '@/modules/recruiter/components/advertised/pnet/FormControls'
import { RichTextSection } from '@/modules/recruiter/components/advertised/pnet/RichTextSection'
import {
  PNET_CONTRACT_TYPES,
  PNET_EXPERIENCE,
  PNET_LOCATIONS,
  PNET_SECTORS,
  PNET_SITUATION_TYPES,
  PNET_WORK_FIELDS,
  PNET_WORK_TYPES,
} from '@/modules/recruiter/data/pnetOptions'
import { mandateApi } from '@/services/api/mandateApi'
import { usePageTitle } from '@/hooks/usePageTitle'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { JobPost } from '@/types/api'
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

const toValues = (post: JobPost): PnetFormValues => ({
  ...initialValues,
  jobTitle: post.title ?? '',
  jobLocation: post.location ?? '',
  location: post.location?.split(',')[0]?.trim() ?? '',
  sectors: post.industries ?? [],
  contractTypes: post.employmentType ? [post.employmentType] : [],
  workType: post.workType ?? '',
  experience: post.experienceLevel ?? '',
  description: toDescription(post),
  contactName: post.contactPersonName ?? '',
  contactEmail: post.contactPersonEmail ?? '',
  expiryDate: post.targetCloseDate ? post.targetCloseDate.split('T')[0] : '',
  clientDescription: post.industry ? `Our client is in the ${post.industry} industry.` : '',
})

const BackArrow = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M10 6H2M5.5 2.5L2 6l3.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ListIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M4.5 3h5.5M4.5 6h5.5M4.5 9h5.5M2 3h.01M2 6h.01M2 9h.01" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
)

const CalendarIcon = () => (
  <svg className={styles.calendarIcon} width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1" />
    <path d="M1.5 5h9M4 1.5v2M8 1.5v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

const toDisplayDate = (iso: string) => {
  const [year, month, day] = iso.split('-')
  return year && month && day ? `${day}/${month}/${year}` : ''
}

const PnetPostPage = () => {
  usePageTitle('New Job Post — pNet')
  const navigate = useNavigate()
  const { mandateId } = useParams<{ mandateId: string }>()
  const [values, setValues] = useState<PnetFormValues>(initialValues)
  const [clientName, setClientName] = useState('')

  useEffect(() => {
    if (!mandateId) return
    let cancelled = false
    mandateApi
      .getJobPostDetail(mandateId)
      .then((envelope) => {
        if (cancelled) return
        setValues(toValues(envelope.data))
        setClientName(envelope.data.client ?? '')
      })
      .catch(() => {
        // fields stay empty and can be filled in manually
      })
    return () => {
      cancelled = true
    }
  }, [mandateId])

  const update = <K extends keyof PnetFormValues>(key: K, value: PnetFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const advertiseRoute = ROUTE_PATHS.recruiterAdvertiseJob.replace(':mandateId', mandateId ?? '')
  const heading = clientName ? `${clientName} – PNet` : 'PNet'

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.topBar}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <button type="button" className={styles.backLink} onClick={() => navigate(advertiseRoute)}>
              <BackArrow />
              Back
            </button>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCurrent}>New Job Post</span>
          </nav>
          <span className={styles.statusPill}>
            <span className={styles.statusDot} />
            Posting to pNet
          </span>
        </div>

        <section className={styles.platformCard}>
          <span className={styles.platformLogo} aria-hidden="true">pN</span>
          <div className={styles.platformInfo}>
            <div className={styles.platformTitleRow}>
              <h1 className={styles.platformTitle}>{heading}</h1>
              {values.jobLocation && (
                <span className={styles.locationTag}>
                  {values.jobLocation.split(',')[0]?.trim()}, ZA
                </span>
              )}
            </div>
            <p className={styles.platformSub}>
              Africa's premier executive recruitment platform · Dittox Job Publishing
            </p>
          </div>
          <button type="button" className={styles.backToJobs} onClick={() => navigate(ROUTE_PATHS.recruiterJobPosts)}>
            <ListIcon />
            Back to Jobs
          </button>
        </section>

        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>{heading}</h2>
          <div className={styles.formDivider} />

          <div className={styles.rowTop}>
            <Field label="Job Title" required hint="Please do not include locations in job titles">
              <TextInput value={values.jobTitle} onChange={(e) => update('jobTitle', e.target.value)} />
            </Field>
            <Field label="Job Location" required>
              <TextInput value={values.jobLocation} onChange={(e) => update('jobLocation', e.target.value)} />
            </Field>
            <Field label="Number of Vacancies">
              <TextInput
                type="number"
                min={1}
                className={styles.centered}
                value={values.vacancies}
                onChange={(e) => update('vacancies', e.target.value)}
              />
            </Field>
          </div>

          <div className={styles.rowTwo}>
            <Field label="Locations">
              <SelectField ariaLabel="Locations" value={values.location} options={PNET_LOCATIONS} onChange={(v) => update('location', v)} placeholder="Select location" />
            </Field>
            <Field label="Work Field">
              <SelectField ariaLabel="Work Field" value={values.workField} options={PNET_WORK_FIELDS} onChange={(v) => update('workField', v)} placeholder="Select work field" />
            </Field>
          </div>

          <div className={styles.rowTwo}>
            <Field label="Sector" group>
              <ChipSelect ariaLabel="Sector" values={values.sectors} options={PNET_SECTORS} onChange={(v) => update('sectors', v)} />
            </Field>
            <Field label="Contract Type" group>
              <ChipSelect ariaLabel="Contract Type" values={values.contractTypes} options={PNET_CONTRACT_TYPES} onChange={(v) => update('contractTypes', v)} />
            </Field>
          </div>

          <div className={styles.rowTwo}>
            <Field label="Work Type">
              <SelectField ariaLabel="Work Type" value={values.workType} options={PNET_WORK_TYPES} onChange={(v) => update('workType', v)} placeholder="Select work type" />
            </Field>
            <Field label="Experience">
              <SelectField ariaLabel="Experience" value={values.experience} options={PNET_EXPERIENCE} onChange={(v) => update('experience', v)} placeholder="Select experience" />
            </Field>
          </div>

          <div className={`${styles.rowTwo} ${styles.rowLast}`}>
            <Field label="Situation Type">
              <SelectField ariaLabel="Situation Type" value={values.situationType} options={PNET_SITUATION_TYPES} onChange={(v) => update('situationType', v)} placeholder="Select situation" />
            </Field>
            <Field label="Salary">
              <TextInput value={values.salary} onChange={(e) => update('salary', e.target.value)} />
            </Field>
          </div>
        </section>

        <RichTextSection title="Job Description" value={values.description} onChange={(v) => update('description', v)} height={158} />
        <RichTextSection title="Candidate Profile" value={values.candidateProfile} onChange={(v) => update('candidateProfile', v)} placeholder="Describe the ideal candidate" height={96} />
        <RichTextSection title="Offer Description" value={values.offerDescription} onChange={(v) => update('offerDescription', v)} placeholder="Describe the offer and benefits" height={96} />

        <section className={styles.contactCard}>
          <Field label="Keywords" hint="Add keywords for better matching">
            <TextInput
              className={styles.keywordsInput}
              placeholder="e.g. Banking, Debt Collection, Salesforce, Excel"
              value={values.keywords}
              onChange={(e) => update('keywords', e.target.value)}
            />
          </Field>
          <div className={styles.contactRow}>
            <Field label="Contact Name">
              <TextInput className={styles.contactInput} value={values.contactName} onChange={(e) => update('contactName', e.target.value)} />
            </Field>
            <Field label="Contact Email" required>
              <TextInput className={styles.contactInput} type="email" value={values.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} />
            </Field>
            <Field label="Expiry Date" hint="Ditto expiry date. PNet listing duration is controlled separately by PNet.">
              <span className={styles.dateWrap}>
                <TextInput className={styles.contactInput} readOnly value={toDisplayDate(values.expiryDate)} aria-label="Expiry Date" />
                <input
                  type="date"
                  className={styles.dateNative}
                  aria-label="Pick expiry date"
                  value={values.expiryDate}
                  onChange={(e) => update('expiryDate', e.target.value)}
                />
                <CalendarIcon />
              </span>
            </Field>
          </div>
        </section>

        <RichTextSection title="Client Description" value={values.clientDescription} onChange={(v) => update('clientDescription', v)} height={82} />
      </div>

      <DittoFooter onBack={() => navigate(advertiseRoute)} />
    </div>
  )
}

export default PnetPostPage
