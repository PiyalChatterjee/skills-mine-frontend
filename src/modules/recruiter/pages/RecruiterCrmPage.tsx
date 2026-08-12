import { Box, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import styles from './RecruiterCrmPage.module.css'

// ── Types ──────────────────────────────────────────────────────────────

type LeadType = 'Hot Lead' | 'Needs Attention' | 'Warm Contact' | 'Cold Lead'

type FollowUpStatus =
  | { kind: 'followUp'; days: number }
  | { kind: 'overdue'; days: number }

type CrmContact = {
  id: string
  leadType: LeadType
  company: string
  lastContactAgo: string
  notes: string
  followUp: FollowUpStatus
}

// ── Mock Data ─────────────────────────────────────────────────────────

const CRM_CONTACTS: CrmContact[] = [
  {
    id: '1',
    leadType: 'Hot Lead',
    company: 'Standard Bank',
    lastContactAgo: '31 days ago',
    notes: 'Reports indicate that Standard Bank are about to open a few new positions.',
    followUp: { kind: 'followUp', days: 9 },
  },
  {
    id: '2',
    leadType: 'Needs Attention',
    company: 'Overberg Personnel',
    lastContactAgo: '2 days ago',
    notes: 'Preparing for hiring',
    followUp: { kind: 'overdue', days: 1 },
  },
  {
    id: '3',
    leadType: 'Hot Lead',
    company: 'Dynamic Propellers CC',
    lastContactAgo: '0 days ago',
    notes: 'Hiring for 50+ roles because of new product launch',
    followUp: { kind: 'followUp', days: 9 },
  },
  {
    id: '4',
    leadType: 'Hot Lead',
    company: 'MANCOSA',
    lastContactAgo: '7 days ago',
    notes: 'Reports indicate that MANCOSA are about to open a few new positions.',
    followUp: { kind: 'followUp', days: 9 },
  },
  {
    id: '5',
    leadType: 'Warm Contact',
    company: 'FNB (Private Segment)',
    lastContactAgo: '23 days ago',
    notes: "FNB have a lot of new job listings on their careers page of their website but haven't reached out to us recently.",
    followUp: { kind: 'followUp', days: 0 },
  },
  {
    id: '6',
    leadType: 'Cold Lead',
    company: 'MASA Outsourcing (Pty) Ltd',
    lastContactAgo: '90 days ago',
    notes: "MASA Outsourcing hasn't had any new Job Posts in over 3 months.",
    followUp: { kind: 'overdue', days: 1 },
  },
]

// ── Derived stat counts ────────────────────────────────────────────────

const STAT_COUNTS = {
  needsAttention: CRM_CONTACTS.filter(c => c.leadType === 'Needs Attention').length,
  hotLeads:       CRM_CONTACTS.filter(c => c.leadType === 'Hot Lead').length,
  warmContacts:   CRM_CONTACTS.filter(c => c.leadType === 'Warm Contact').length,
  coldLeads:      CRM_CONTACTS.filter(c => c.leadType === 'Cold Lead').length,
}

// ── Inline SVG Icons ───────────────────────────────────────────────────

const AlertIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const FlameIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M8.5 14.5C8.5 16.985 10.015 19 12 19s3.5-2.015 3.5-4.5c0-2-1.5-3.5-2-5-.5 1.5-1 2-2 3-.5-1-1-2-1-3.5C9 11 8.5 12.5 8.5 14.5z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M12 19c-3.314 0-6-2.686-6-6 0-4 3-7 4-9 .5 2 2 3.5 2 5.5 1-1.5 1.5-3 1-5 2 2 5 5 5 8.5 0 3.314-2.686 6-6 6z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
)

const SunIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    />
  </svg>
)

const SnowflakeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2v20M2 12h20M5.64 5.64l12.72 12.72M18.36 5.64L5.64 18.36"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
      stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
    />
  </svg>
)

const ClipboardIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const PencilIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
)

const MagnifierIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────

function cardColorClass(leadType: LeadType): string {
  switch (leadType) {
    case 'Hot Lead':        return styles.crmCardGreen
    case 'Needs Attention': return styles.crmCardRed
    case 'Warm Contact':    return styles.crmCardAmber
    case 'Cold Lead':       return styles.crmCardTeal
  }
}

function BadgeIcon({ leadType }: { leadType: LeadType }) {
  if (leadType === 'Hot Lead')        return <FlameIcon />
  if (leadType === 'Needs Attention') return <AlertIcon />
  if (leadType === 'Warm Contact')    return <SunIcon />
  return <SnowflakeIcon />
}

function StatIcon({ leadType }: { leadType: LeadType }) {
  if (leadType === 'Needs Attention') return <AlertIcon size={20} />
  if (leadType === 'Hot Lead')        return <FlameIcon size={20} />
  if (leadType === 'Warm Contact')    return <SunIcon size={20} />
  return <SnowflakeIcon size={20} />
}

// ── Sub-components ────────────────────────────────────────────────────

type StatTileProps = {
  value: number
  label: string
  colorClass: string
  leadType: LeadType
}

const StatTile = ({ value, label, colorClass, leadType }: StatTileProps) => (
  <Box className={`${styles.statTile} ${colorClass}`}>
    <Box className={styles.statTileTop}>
      <Typography component="p" className={styles.statTileValue}>{value}</Typography>
      <Box className={styles.statTileIcon}><StatIcon leadType={leadType} /></Box>
    </Box>
    <Typography component="p" className={styles.statTileLabel}>{label}</Typography>
  </Box>
)

type CrmCardProps = {
  contact: CrmContact
  onUpdate: (id: string) => void
}

const CrmCard = ({ contact, onUpdate }: CrmCardProps) => {
  const isOverdue = contact.followUp.kind === 'overdue'

  const followUpText = isOverdue
    ? `Overdue: ${contact.followUp.days} day${contact.followUp.days !== 1 ? 's' : ''}`
    : `Follow up: ${contact.followUp.days} day${contact.followUp.days !== 1 ? 's' : ''}`

  return (
    <Box className={`${styles.crmCard} ${cardColorClass(contact.leadType)}`}>

      {/* Badge | line | status */}
      <Box className={styles.cardTopRow}>
        <Box className={styles.badgeTag}>
          <Box className={styles.badgeTagIcon}><BadgeIcon leadType={contact.leadType} /></Box>
          <Typography component="span" className={styles.badgeTagText}>
            {contact.leadType}
          </Typography>
        </Box>

        <Box className={styles.cardDividerLine} />

        <Box className={`${styles.statusTag} ${isOverdue ? styles.statusTagOverdue : styles.statusTagFollowUp}`}>
          <Box className={styles.statusTagIcon}><CalendarIcon /></Box>
          <Typography component="span" className={styles.statusTagText}>
            {followUpText}
          </Typography>
        </Box>
      </Box>

      {/* Company */}
      <Typography component="h3" className={styles.companyName}>
        {contact.company}
      </Typography>

      {/* Last contact */}
      <Box className={styles.lastContactRow}>
        <Box className={styles.rowIcon}><PhoneIcon /></Box>
        <Typography component="p" className={styles.lastContactText}>
          Last Contact: {contact.lastContactAgo}
        </Typography>
      </Box>

      {/* Notes */}
      <Box className={styles.notesRow}>
        <Box className={styles.notesIconWrap}><ClipboardIcon /></Box>
        <Box className={styles.notesTextCol}>
          <Typography component="p" className={styles.notesLabel}>Notes</Typography>
          <Typography component="p" className={styles.notesContent}>{contact.notes}</Typography>
        </Box>
      </Box>

      {/* Update button */}
      <Box className={styles.cardBottomRow}>
        <ButtonBase className={styles.updateBtn} onClick={() => onUpdate(contact.id)} disableRipple>
          <PencilIcon />
          Update
        </ButtonBase>
      </Box>

    </Box>
  )
}

// ── Page Component ────────────────────────────────────────────────────

const RecruiterCrmPage = () => {
  const handleUpdate = (_id: string) => {
    // TODO: open update modal
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>
        <Typography component="h1" className={styles.pageTitle}>
          Relationship CRM
        </Typography>

        {/* Stat tiles */}
        <Box className={styles.statTilesPanel}>
          <StatTile value={STAT_COUNTS.needsAttention} label="Needs Attention" colorClass={styles.statTileRed}   leadType="Needs Attention" />
          <StatTile value={STAT_COUNTS.hotLeads}       label="Hot Leads"       colorClass={styles.statTileGreen} leadType="Hot Lead" />
          <StatTile value={STAT_COUNTS.warmContacts}   label="Warm Contacts"   colorClass={styles.statTileAmber} leadType="Warm Contact" />
          <StatTile value={STAT_COUNTS.coldLeads}      label="Cold Leads"      colorClass={styles.statTileTeal}  leadType="Cold Lead" />
        </Box>

        {/* Search */}
        <Box className={styles.searchWrap}>
          <Box className={styles.searchIcon}><MagnifierIcon /></Box>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search"
            aria-label="Search contacts"
          />
        </Box>

        {/* Cards */}
        <Box className={styles.cardsList}>
          {CRM_CONTACTS.map((contact) => (
            <CrmCard key={contact.id} contact={contact} onUpdate={handleUpdate} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default RecruiterCrmPage
