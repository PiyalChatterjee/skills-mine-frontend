import { describe, expect, it } from 'vitest'
import { cardColorClass, leadLabel } from './presentation'
import styles from '@/modules/recruiter/pages/RecruiterCrmPage.module.css'

describe('CRM presentation helpers', () => {
  it.each([
    ['hot_lead', 'Hot Lead', styles.crmCardGreen],
    ['needs_attention', 'Needs Attention', styles.crmCardRed],
    ['warm_contact', 'Warm Contact', styles.crmCardAmber],
    ['cold_lead', 'Cold Lead', styles.crmCardTeal],
  ])('preserves the label and card color for %s', (status, label, color) => {
    expect(leadLabel(status)).toBe(label)
    expect(cardColorClass(label)).toBe(color)
  })

  it('preserves unknown statuses and uses a neutral color', () => {
    expect(leadLabel('new_status')).toBe('new_status')
    expect(cardColorClass(leadLabel('new_status'))).toBe(styles.crmCardNeutral)
  })

  it('labels blank statuses as unclassified', () => {
    expect(leadLabel('')).toBe('Unclassified')
    expect(cardColorClass(leadLabel(''))).toBe(styles.crmCardNeutral)
  })
})
