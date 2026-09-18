// Keys match the real backend pipeline stage codes (INBOUND, SCREENING, ASSESSMENT,
// INTERVIEW, SHORTLIST, OFFER, REJECT, CLOSED), lower-cased, plus a few historical
// aliases so labels stay consistent with the dashboard's own stage mapping.
const APPLICATION_STATUS_LABELS: Record<string, string> = {
  inbound: 'Applied',
  applied: 'Applied',
  screening: 'Screening',
  assessment: 'Assessment',
  interview: 'Interview',
  shortlist: 'Shortlisted',
  shortlisted: 'Shortlisted',
  offer: 'Offer',
  offer_extended: 'Offer',
  offer_accepted: 'Closed',
  offer_declined: 'Closed',
  reject: 'Closed',
  rejected: 'Closed',
  placed: 'Placed',
  closed: 'Closed',
}

const APPLICATION_STATUS_KEYS = {
  inbound: 'applied',
  applied: 'applied',
  screening: 'screening',
  assessment: 'assessment',
  interview: 'interview',
  shortlist: 'shortlisted',
  shortlisted: 'shortlisted',
  offer: 'offer_extended',
  offer_extended: 'offer_extended',
  offer_accepted: 'offer_accepted',
  offer_declined: 'offer_declined',
} as const

export type ApplicationStatusKey =
  | (typeof APPLICATION_STATUS_KEYS)[keyof typeof APPLICATION_STATUS_KEYS]
  | 'unknown'

export const getApplicationStatusLabel = (stage: string | undefined) => {
  if (!stage) return undefined

  const normalizedStage = stage.trim().toLowerCase()
  return APPLICATION_STATUS_LABELS[normalizedStage] ?? stage
}

export const getApplicationStatusKey = (
  stage: string | undefined | null,
): ApplicationStatusKey => {
  if (!stage) return 'unknown'
  return APPLICATION_STATUS_KEYS[stage.trim().toLowerCase() as keyof typeof APPLICATION_STATUS_KEYS] ?? 'unknown'
}