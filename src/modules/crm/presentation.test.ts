import { describe, expect, it } from 'vitest'
import { cardColorClass, getFollowupDayOffset, leadLabel } from './presentation'
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

  it.each([
    { lastContactDays: 3, followupDays: 5, overdueDays: 0, expected: 5 },
    { lastContactDays: 3, followupDays: 0, overdueDays: 8, expected: -8 },
    { lastContactDays: 16, followupDays: 0, overdueDays: 12, expected: -12 },
    { lastContactDays: 8, followupDays: 0, overdueDays: 0, expected: 0 },
    { lastContactDays: 0, followupDays: 1, overdueDays: 0, expected: 1 },
    { lastContactDays: 0, followupDays: -1, overdueDays: 0, expected: -1 },
    { lastContactDays: null, followupDays: 5, overdueDays: 0, expected: 5 },
    { lastContactDays: 3, followupDays: null, overdueDays: 0, expected: null },
    { lastContactDays: NaN, followupDays: 5, overdueDays: 0, expected: 5 },
    { lastContactDays: 3, followupDays: Infinity, overdueDays: 0, expected: null },
  ])('calculates the follow-up offset from today: %j', ({ expected, ...timing }) => {
    expect(getFollowupDayOffset({
      clientId: 'client-1', clientName: 'Employer', status: 'hot_lead', ...timing,
    })).toBe(expected)
  })
})
