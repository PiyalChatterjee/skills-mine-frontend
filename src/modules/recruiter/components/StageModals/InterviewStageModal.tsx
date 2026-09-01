import { useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import styles from './InterviewStageModal.module.css'

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

// ── Props ──────────────────────────────────────────────────────────────

export interface InterviewStageModalProps {
  candidateName: string
  candidateTitle: string
  company: string
  dueDate?: string
  onClose: () => void
}

// ── Component ──────────────────────────────────────────────────────────

const InterviewStageModal = ({
  candidateName,
  candidateTitle,
  company,
  dueDate = 'Jan 20, 2026',
  onClose,
}: InterviewStageModalProps) => {
  const [notes, setNotes] = useState(
    'Andrew performed exceptionally well during the interview and is a strong candidate.'
  )

  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Interview stage details for ${candidateName}`}
      >
        {/* ── Close button row ── */}
        <Box className={styles.closeBtnRow}>
          <ButtonBase className={styles.closeBtn} onClick={onClose} disableRipple aria-label="Close">
            <CloseIcon />
          </ButtonBase>
        </Box>

        {/* ── Stage banner ── */}
        <Box className={styles.stageBanner}>
          <Typography component="h2" className={styles.stageBannerText}>
            Interview
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
          <Box className={styles.dueDateRow}>
            <CalendarIcon />
            <Typography component="span" className={styles.dueDate}>
              Due {dueDate}
            </Typography>
          </Box>

          {/* ── Recruiter notes ── */}
          <Box className={styles.notesSection}>
            <Typography component="label" htmlFor="recruiter-notes" className={styles.notesLabel}>
              Recruiter notes *
            </Typography>
            <textarea
              id="recruiter-notes"
              className={styles.notesTextarea}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
          </Box>

          {/* ── Divider ── */}
          <Box className={styles.footerDivider} />

          {/* ── Action buttons ── */}
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.moveBackBtn} disableRipple disabled>
              Move back
            </ButtonBase>
            <ButtonBase className={styles.rejectBtn} disableRipple>
              Reject
            </ButtonBase>
            <ButtonBase className={styles.advanceBtn} disableRipple>
              Advance
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default InterviewStageModal
