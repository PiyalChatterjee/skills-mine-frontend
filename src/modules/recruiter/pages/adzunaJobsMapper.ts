import type { AdzunaJobJsonRecord } from '@/services/api/adzunaApi'
import type { AdvertisedJob } from '@/modules/recruiter/data/advertisedJobsData'

const formatPostedDate = (createdAt: string) => {
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatSalary = (record: AdzunaJobJsonRecord) => {
  const { salary_min: min, salary_max: max, salary_currency: currency, salary_frequency: frequency } = record.job_data
  if (min == null && max == null) return 'Market Related'

  const symbol = currency === 'ZAR' || currency === 'R' ? 'R' : currency ? `${currency} ` : ''
  const amount = (value: number) => `${symbol}${value.toLocaleString('en-ZA')}`
  const frequencyLabels: Record<string, string> = {
    hour: 'ph',
    day: 'pd',
    month: 'pm',
    year: 'pa',
  }
  const frequencyLabel = frequencyLabels[frequency ?? '']
  const range = min != null && max != null
    ? `${amount(min)} - ${amount(max)}`
    : amount(min ?? max ?? 0)

  return frequencyLabel ? `${range} ${frequencyLabel}` : range
}

const formatEmploymentType = (record: AdzunaJobJsonRecord) => {
  const { contract_type: type, contract_time: time } = record.job_data
  const contractLabel = type === 'permanent'
    ? 'Permanent'
    : type === 'contract'
      ? 'Contract'
      : undefined
  const timeLabel = time === 'full_time'
    ? 'Full Time'
    : time === 'part_time'
      ? 'Part Time'
      : undefined

  return [contractLabel, timeLabel].filter(Boolean).join(' · ') || '—'
}

export const mapAdzunaRecordToAdvertisedJob = (record: AdzunaJobJsonRecord): AdvertisedJob => {
  const data = record.job_data
  const location = [data.location?.city, data.location?.state].filter(Boolean).join(', ')

  return {
    id: record.publish_id || record.job_id,
    title: data.title || data.id || 'Untitled Job',
    reference: data.id || record.job_id || record.publish_id,
    employmentType: formatEmploymentType(record),
    platform: 'Adzuna',
    location: location || data.location?.country || '—',
    salary: formatSalary(record),
    posted: formatPostedDate(record.created_at),
    status: record.is_active ? 'Live' : 'Deleted',
    jobUrl: data.url,
    jobProfileIdRef: data.job_profile_id_ref || data.id || record.job_id,
    adzunaJobId: data.id || record.job_id,
  }
}
