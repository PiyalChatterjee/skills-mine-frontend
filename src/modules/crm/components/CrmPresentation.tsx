import { CrmClassification as CrmStatus, CrmClassificationLabel } from "@/enums/statuses";
import { Box, ButtonBase, Typography } from '@mui/material'
import { crmClassificationLabels } from '@/modules/crm/schema'
import { cardColorClass, getFollowupDayDifference, getFollowupDayOffset, leadLabel } from '@/modules/crm/presentation'
import type { CrmClassification, CrmClient } from '@/types/api'
import attentionIcon from '@/assets/crm/attention.svg'
import hotIcon from '@/assets/crm/hot.svg'
import warmIcon from '@/assets/crm/warm.svg'
import warmStatIcon from '@/assets/crm/warm-stat.svg'
import coldIcon from '@/assets/crm/cold.svg'
import phoneIcon from '@/assets/crm/phone.svg'
import phoneDarkIcon from '@/assets/crm/phone-dark.svg'
import noteIcon from '@/assets/crm/note.svg'
import noteDarkIcon from '@/assets/crm/note-dark.svg'
import calendarIcon from '@/assets/crm/calendar.svg'
import calendarDarkIcon from '@/assets/crm/calendar-dark.svg'
import editIcon from '@/assets/crm/edit.svg'
import editDarkIcon from '@/assets/crm/edit-dark.svg'
import searchIcon from '@/assets/crm/search.svg'
import styles from '@/modules/recruiter/pages/RecruiterCrmPage.module.css'

type LeadType = typeof crmClassificationLabels[CrmClassification]

const leadIcons: Record<LeadType, string> = {
  [CrmClassificationLabel.NEEDS_ATTENTION]: attentionIcon,
  [CrmClassificationLabel.HOT_LEAD]: hotIcon,
  [CrmClassificationLabel.WARM_CONTACT]: warmIcon,
  [CrmClassificationLabel.COLD_LEAD]: coldIcon,
}

function LeadIcon({ leadType, stat = false }: { leadType: string; stat?: boolean }) {
  const icon = Object.entries(leadIcons).find(([label]) => label === leadType)?.[1]
  if (!icon) return null
  return <img src={stat && leadType === CrmClassificationLabel.WARM_CONTACT ? warmStatIcon : icon} alt="" aria-hidden="true" />
}

export const MagnifierIcon = () => <img src={searchIcon} alt="" aria-hidden="true" />

type StatTileProps = {
  value: number | undefined
  label: string
  colorClass: string
  leadType: LeadType
}

export const StatTile = ({ value, label, colorClass, leadType }: StatTileProps) => (
  <Box className={`${styles.statTile} ${colorClass}`}>
    <Box className={styles.statTileTop}>
      <Typography component="p" className={styles.statTileValue}>{value ?? '--'}</Typography>
      <Box className={styles.statTileIcon}><LeadIcon leadType={leadType} stat /></Box>
    </Box>
    <Typography component="p" className={styles.statTileLabel}>{label}</Typography>
  </Box>
)

type CrmCardProps = {
  contact: CrmClient
  onUpdate: (client: CrmClient) => void
}

export const CrmCard = ({ contact, onUpdate }: CrmCardProps) => {
  const leadType = leadLabel(contact.status)
  const isWarm = contact.status === CrmStatus.WARM_CONTACT
  const difference = getFollowupDayDifference(contact)
  const isOverdue = difference != null && difference < 0
  const days = difference == null ? null : Math.abs(difference)
  const statusClass = difference == null || difference === 0
    ? styles.statusTagNeutral
    : isOverdue ? styles.statusTagOverdue : styles.statusTagFollowUp

  return (
    <Box className={`${styles.crmCard} ${cardColorClass(leadType)}`}>
      <Box className={styles.cardTopRow}>
        <Box className={styles.badgeTag}>
          <LeadIcon leadType={leadType} />
          <Typography component="span" className={styles.badgeTagText}>{leadType}</Typography>
        </Box>
        <Box className={styles.cardDividerLine} />
        <Box className={`${styles.statusTag} ${statusClass}`}>
          <img src={isOverdue ? calendarIcon : calendarDarkIcon} alt="" aria-hidden="true" />
          <Typography component="span" className={styles.statusTagText}>
            {days == null ? (
              getFollowupDayOffset(contact) == null ? 'No follow-up scheduled' : 'Follow-up timing unavailable'
            ) : days === 0 ? 'Due today' : (
              <><strong>{isOverdue ? 'Overdue:' : 'Follow up:'}</strong> {days} day{days !== 1 ? 's' : ''}</>
            )}
          </Typography>
        </Box>
      </Box>

      <Box className={styles.companyRow}>
        <Typography component="h3" className={styles.companyName}>{contact.clientName}</Typography>
        <Box className={styles.contactDetails}>
          {contact.contactName && (
            <span className={styles.contactName}>{contact.contactName}</span>
          )}
          {contact.contactNumber && <span className={styles.contactPhone}>{contact.contactNumber}</span>}
        </Box>
      </Box>

      <Box className={styles.lastContactRow}>
        <img src={isWarm ? phoneDarkIcon : phoneIcon} alt="" aria-hidden="true" />
        <Typography component="p" className={styles.lastContactText}>
          Last Contact: {contact.lastContactDays == null ? 'Not recorded' : `${contact.lastContactDays} days ago`}
        </Typography>
      </Box>

      <Box className={styles.cardBottomRow}>
        <Box className={styles.notesRow}>
          <img src={isWarm ? noteDarkIcon : noteIcon} alt="" aria-hidden="true" />
          <Box className={styles.notesTextCol}>
            <Typography component="p" className={styles.notesLabel}>Notes</Typography>
            <Typography component="p" className={styles.notesContent}>{contact.lastNote || 'No interaction notes yet.'}</Typography>
          </Box>
        </Box>
        <ButtonBase className={styles.updateBtn} onClick={() => onUpdate(contact)} aria-label={`Update ${contact.clientName}`} disableRipple>
          <img src={isWarm ? editDarkIcon : editIcon} alt="" aria-hidden="true" />
          Update
        </ButtonBase>
      </Box>
    </Box>
  )
}
