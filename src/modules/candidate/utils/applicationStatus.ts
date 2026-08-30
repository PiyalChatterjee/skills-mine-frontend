const APPLICATION_STATUS_LABELS: Record<string, string> = {
  applied: 'Applied',
  screening: 'Screening',
  assessment: 'Assessment',
  interview: 'Interview',
  shortlisted: 'Shortlisted',
  offer: 'Offer',
  offer_extended: 'Offer',
  offer_accepted: 'Closed',
  offer_declined: 'Closed',
  placed: 'Placed',
  closed: 'Closed',
}

export const getApplicationStatusLabel = (stage: string | undefined) => {
  if (!stage) return undefined

  const normalizedStage = stage.trim().toLowerCase()
  return APPLICATION_STATUS_LABELS[normalizedStage] ?? stage
}