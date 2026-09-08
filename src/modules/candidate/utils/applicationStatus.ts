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

export const getApplicationStatusLabel = (stage: string | undefined) => {
  if (!stage) return undefined

  const normalizedStage = stage.trim().toLowerCase()
  return APPLICATION_STATUS_LABELS[normalizedStage] ?? stage
}