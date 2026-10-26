import { crmClassificationLabels, crmClassifications } from './schema'
import styles from '@/modules/recruiter/pages/RecruiterCrmPage.module.css'

export function leadLabel(status: string): string {
  const classification = crmClassifications.find((value) => value === status)
  return classification ? crmClassificationLabels[classification] : status || 'Unclassified'
}

export function cardColorClass(leadType: string): string {
  switch (leadType) {
    case 'Hot Lead':        return styles.crmCardGreen
    case 'Needs Attention': return styles.crmCardRed
    case 'Warm Contact':    return styles.crmCardAmber
    case 'Cold Lead':       return styles.crmCardTeal
    default:               return styles.crmCardNeutral
  }
}
