import { Box, ButtonBase, Typography } from '@mui/material'
import styles from './ClosedStageModal.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="#57606a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="#6B7280" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ShieldCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4Z" stroke="#4BAF73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="#4BAF73" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ShieldXIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4Z" stroke="#D64545" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9l6 6M15 9l-6 6" stroke="#D64545" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Props ──────────────────────────────────────────────────────────────

export interface ClosedStageModalProps {
  candidateName: string
  candidateTitle: string
  company: string
  dueDate?: string
  isUnsuccessful?: boolean
  onClose: () => void
}

// ── Component ──────────────────────────────────────────────────────────

const ClosedStageModal = ({
  candidateName,
  candidateTitle,
  company,
  dueDate,
  isUnsuccessful = false,
  onClose,
}: ClosedStageModalProps) => {
  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Closed stage details for ${candidateName}`}
      >
        {/* ── Close button row ── */}
        <Box className={styles.closeBtnRow}>
          <ButtonBase className={styles.closeBtn} onClick={onClose} disableRipple aria-label="Close">
            <CloseIcon />
          </ButtonBase>
        </Box>

        {/* ── Stage banner ── */}
        <Box className={`${styles.stageBanner} ${isUnsuccessful ? styles.stageBannerUnsuccessful : ''}`}>
          <Typography component="h2" className={`${styles.stageBannerText} ${isUnsuccessful ? styles.stageBannerTextUnsuccessful : ''}`}>
            Closed
          </Typography>
        </Box>

        {/* ── Padded content ── */}
        <Box className={styles.content}>
          {/* ── Candidate name ── */}
          <Typography component="h3" className={styles.candidateName}>
            {candidateName}
          </Typography>

          {/* ── Job title + company ── */}
          <Typography component="p" className={styles.jobInfo}>
            {candidateTitle}, {company}
          </Typography>

          {/* ── Due date ── */}
          {dueDate && (
            <Box className={styles.dueDateRow}>
              <CalendarIcon />
              <Typography component="span" className={styles.dueDate}>
                Due {dueDate}
              </Typography>
            </Box>
          )}

          {/* ── Placement info card ── */}
          <Box className={`${styles.infoCard} ${isUnsuccessful ? styles.infoCardUnsuccessful : ''}`}>
            <Box className={styles.infoCardIcon}>
              {isUnsuccessful ? <ShieldXIcon /> : <ShieldCheckIcon />}
            </Box>
            <Box className={styles.infoCardText}>
              <Typography component="p" className={`${styles.infoCardTitle} ${isUnsuccessful ? styles.infoCardTitleUnsuccessful : ''}`}>
                {isUnsuccessful ? 'Unsuccessful Placement' : 'Successful Placement'}
              </Typography>
              <Typography component="p" className={styles.infoCardDesc}>
                {isUnsuccessful
                  ? 'This will be counted as an unsuccessful placement for this month'
                  : 'This will be counted as a successful placement for this month'}
              </Typography>
            </Box>
          </Box>

          {/* ── Divider ── */}
          <Box className={styles.footerDivider} />

          {/* ── Done button ── */}
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.doneBtn} onClick={onClose} disableRipple>
              Done
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ClosedStageModal
