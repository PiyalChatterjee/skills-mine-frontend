import { CrmClassificationLabel } from "@/enums/statuses";
import { crmClassificationLabels, crmClassifications } from './schema'
import styles from '@/modules/recruiter/pages/RecruiterCrmPage.module.css'
import type { CrmClient } from '@/types/api'

export function getFollowupDayOffset(contact: CrmClient): number | null {
  if (contact.overdueDays != null && Number.isInteger(contact.overdueDays) && contact.overdueDays > 0) {
    return -contact.overdueDays
  }
  return contact.followupDays != null && Number.isInteger(contact.followupDays)
    ? contact.followupDays
    : null
}

export function leadLabel(status: string): string {
  const classification = crmClassifications.find((value) => value === status)
  return classification ? crmClassificationLabels[classification] : status || 'Unclassified'
}

export function cardColorClass(leadType: string): string {
  switch (leadType) {
    case CrmClassificationLabel.HOT_LEAD:        return styles.crmCardGreen
    case CrmClassificationLabel.NEEDS_ATTENTION: return styles.crmCardRed
    case CrmClassificationLabel.WARM_CONTACT:    return styles.crmCardAmber
    case CrmClassificationLabel.COLD_LEAD:       return styles.crmCardTeal
    default:               return styles.crmCardNeutral
  }
}
