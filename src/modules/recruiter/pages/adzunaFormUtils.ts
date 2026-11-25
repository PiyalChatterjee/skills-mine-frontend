import type { JobPost } from '@/types/api'
import type { AdzunaPrefill, AdzunaPrefillResponse, PublishAdzunaJobRequest } from '@/services/api/adzunaApi'
import {
  ADZUNA_CATEGORIES,
  ADZUNA_SALARY_FREQUENCIES,
  type AdzunaSalaryDisplay,
} from '@/modules/recruiter/data/adzunaOptions'

export type AdzunaFormValues = {
  jobTitle: string
  jobLocation: string
  country: string
  publicationDate: string
  category: string
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
  companyName: string
}

export const initialAdzunaFormValues: AdzunaFormValues = {
  jobTitle: '',
  jobLocation: '',
  country: 'South Africa',
  publicationDate: '',
  category: '',
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
  companyName: '',
}

const toBullets = (lines: string[] | undefined) =>
  (lines ?? []).map((line) => `• ${line.replace(/^•\s*/, '')}`).join('\n')

const toJobDescription = (post: JobPost) => {
  const responsibilities = toBullets(post.responsibilities)
  return [post.jobDescription, responsibilities && `Key Responsibilities:\n${responsibilities}`]
    .filter(Boolean)
    .join('\n\n')
}

const formatRand = (amount: number | undefined) =>
  typeof amount === 'number' && amount > 0
    ? `R ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
    : ''

const salaryFrequencyLabels: Record<NonNullable<AdzunaPrefill['salary_frequency']>, string> = {
  hour: 'Per Hour',
  day: 'Per Day',
  month: 'Per Month',
  year: 'Per Year',
}

const salaryFrequencyValues: Record<string, NonNullable<AdzunaPrefill['salary_frequency']> | undefined> = {
  'Per Hour': 'hour',
  'Per Day': 'day',
  'Per Month': 'month',
  'Per Year': 'year',
}

const contractTypeLabels: Record<NonNullable<AdzunaPrefill['contract_type']>, string> = {
  permanent: 'Permanent',
  contract: 'Contract',
}

const contractTypeValues: Record<string, NonNullable<AdzunaPrefill['contract_type']> | undefined> = {
  Permanent: 'permanent',
  Contract: 'contract',
}

const contractTimeLabels: Record<NonNullable<AdzunaPrefill['contract_time']>, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
}

const contractTimeValues: Record<string, NonNullable<AdzunaPrefill['contract_time']> | undefined> = {
  'Full Time': 'full_time',
  'Part Time': 'part_time',
}

const formatLocation = (location: AdzunaPrefill['location']) =>
  [location?.city, location?.state].filter(Boolean).join(', ')

const industryCategoryIds: Record<string, number> = {
  technology: 2,
  banking: 1,
  healthcare: 7,
  education: 11,
  retail: 17,
  manufacturing: 19,
  'logistics & supply chain': 10,
  consulting: 18,
  legal: 14,
}

const categoryFromIndustry = (industry: string) => {
  const categoryId = industryCategoryIds[industry.trim().toLowerCase()] ?? 29
  const category = ADZUNA_CATEGORIES.find(({ id }) => id === categoryId)
  if (!category) throw new Error(`Unsupported Adzuna category ID: ${categoryId}.`)
  return category.label
}

export const getAdzunaCategoryWarning = (categoryId: number | undefined, selectedCategory: string) => {
  if (categoryId == null || ADZUNA_CATEGORIES.some(({ id }) => id === categoryId)) return undefined
  if (categoryId === 0 && selectedCategory) return undefined
  return `Unsupported Adzuna category ID: ${categoryId}. ${selectedCategory ? `Using ${selectedCategory}; please review.` : 'Select a valid category.'}`
}

export const toAdzunaFormValues = (post: JobPost): AdzunaFormValues => ({
  ...initialAdzunaFormValues,
  jobTitle: post.title ?? '',
  jobLocation: post.location ?? '',
  category: categoryFromIndustry(post.industry ?? ''),
  contractTypes: post.employmentType ? [post.employmentType] : [],
  employmentType: post.employmentType ?? '',
  workingModel: post.workType ?? '',
  seniority: post.experienceLevel ?? '',
  minSalary: formatRand(post.salaryMin),
  maxSalary: formatRand(post.salaryMax),
  description: toJobDescription(post),
  requirements: toBullets(post.requirements),
  perks: toBullets(post.benefits),
  keywords: (post.skills ?? []).join(', '),
  companyName: post.client ?? '',
})

export const applyAdzunaPrefill = (
  base: AdzunaFormValues,
  { prefill }: AdzunaPrefillResponse,
  isPublished = false,
): AdzunaFormValues => {
  const next = { ...base }
  if (prefill.title) next.jobTitle = prefill.title
  if (prefill.description) next.description = prefill.description
  if (isPublished && prefill.description) {
    const sections = prefill.description.split(/\n\n(Requirements|Benefits):\n/)
    next.description = sections[0]
    next.requirements = ''
    next.perks = ''
    for (let index = 1; index < sections.length; index += 2) {
      if (sections[index] === 'Requirements') next.requirements = sections[index + 1] ?? ''
      if (sections[index] === 'Benefits') next.perks = sections[index + 1] ?? ''
    }
  }
  if (prefill.location) next.jobLocation = formatLocation(prefill.location)
  if (prefill.location?.country) next.country = prefill.location.country
  else if (prefill.country) next.country = prefill.country === 'ZA' ? 'South Africa' : prefill.country
  if (prefill.date) next.publicationDate = prefill.date
  if (prefill.remote === 0) next.workingModel = 'On-site'
  if (prefill.remote === 1) next.workingModel = 'Remote'
  if (prefill.category != null) {
    next.category = ADZUNA_CATEGORIES.find(({ id }) => id === prefill.category)?.label ?? base.category
  }
  if (prefill.contract_type) next.contractTypes = [contractTypeLabels[prefill.contract_type]]
  if (prefill.contract_time) next.employmentType = contractTimeLabels[prefill.contract_time]
  if (prefill.salary_min != null) next.minSalary = formatRand(prefill.salary_min)
  if (prefill.salary_max != null) next.maxSalary = formatRand(prefill.salary_max)
  if (prefill.salary_currency) {
    next.currency = prefill.salary_currency === 'ZAR'
      ? 'ZAR (R)'
      : prefill.salary_currency
  }
  if (prefill.salary_frequency) next.frequency = salaryFrequencyLabels[prefill.salary_frequency]
  if (prefill.url) next.applicationUrl = prefill.url
  if (prefill.company) next.companyName = prefill.company
  return next
}

const parseSalary = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const amount = digits ? Number(digits) : 0
  return amount > 0 ? amount : undefined
}

const buildRequestDescription = (values: AdzunaFormValues) =>
  [
    values.description.trim(),
    values.requirements.trim() && `Requirements:\n${values.requirements.trim()}`,
    values.perks.trim() && `Benefits:\n${values.perks.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n')

const toLocation = (value: string, prefill: AdzunaPrefill['location']): NonNullable<PublishAdzunaJobRequest['location']> => {
  const parts = value.split(',').map((part) => part.trim()).filter(Boolean)
  const city = parts[0] || prefill?.city
  const state = parts.length > 1 ? parts.slice(1).join(', ') : (!value.trim() ? prefill?.state : undefined)
  return {
    ...(city ? { city } : {}),
    ...(state ? { state } : {}),
    country: prefill?.country ?? 'South Africa',
  }
}

const getSalaryCurrency = (currency: string) => currency.split(/[ (]/)[0] || 'ZAR'

export const buildAdzunaPublishRequest = (
  values: AdzunaFormValues,
  prefill: AdzunaPrefill,
  jobProfileId: string,
  jobProfileUrl: string,
  adzunaJobId?: string,
): PublishAdzunaJobRequest => {
  const category = ADZUNA_CATEGORIES.find(({ label }) => label === values.category)
  if (!category) throw new Error('Select a valid Adzuna category.')
  const includeSalary = values.salaryDisplay !== 'hide'
  const frequency = ADZUNA_SALARY_FREQUENCIES.includes(values.frequency)
    ? salaryFrequencyValues[values.frequency]
    : undefined

  return {
    ...prefill,
    id: adzunaJobId ?? prefill.id ?? jobProfileId,
    title: values.jobTitle.trim(),
    description: buildRequestDescription(values),
    url: values.applicationUrl.trim() || prefill.url || jobProfileUrl,
    location: { ...toLocation(values.jobLocation, prefill.location), country: values.country.trim() },
    country: values.country.trim().toLowerCase() === 'south africa' ? 'ZA' : values.country.trim(),
    date: values.publicationDate || prefill.date,
    remote: values.workingModel ? (values.workingModel === 'Remote' ? 1 : 0) : prefill.remote,
    job_profile_id_ref: prefill.job_profile_id_ref ?? jobProfileId,
    company: values.companyName.trim() || prefill.company || undefined,
    category: category.id,
    contract_type: values.contractTypes
      .map((type) => contractTypeValues[type])
      .find((type) => type !== undefined),
    contract_time: contractTimeValues[values.employmentType],
    salary_min: includeSalary ? parseSalary(values.minSalary) : undefined,
    salary_max: includeSalary ? parseSalary(values.maxSalary) : undefined,
    salary_currency: includeSalary ? getSalaryCurrency(values.currency) : undefined,
    salary_frequency: includeSalary ? frequency : undefined,
  }
}
