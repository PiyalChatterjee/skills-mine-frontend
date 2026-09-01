import { useState } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import styles from './ScreeningStageModal.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="#57606a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="#57606a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke="#57606a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Props ──────────────────────────────────────────────────────────────

export interface ScreeningStageModalProps {
  candidateName: string
  candidateTitle: string
  company: string
  dueDate?: string
  onClose: () => void
}

// ── Component ──────────────────────────────────────────────────────────

const ScreeningStageModal = ({
  candidateName,
  candidateTitle,
  company,
  dueDate = 'Jan 20, 2026',
  onClose,
}: ScreeningStageModalProps) => {
  const [checked, setChecked] = useState([false, false])

  const toggle = (i: number) =>
    setChecked(prev => prev.map((v, idx) => (idx === i ? !v : v)))

  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Screening stage details for ${candidateName}`}
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
            Screening
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

          {/* ── Suitability note ── */}
          <Typography component="p" className={styles.suitabilityNote}>
            CV Suitability score over 85%
          </Typography>

          {/* ── Checklist ── */}
          <Box className={styles.checklist}>
            <Box className={styles.checklistItem}>
              <Box
                component="button"
                className={`${styles.checkbox} ${checked[0] ? styles.checkboxChecked : ''}`}
                onClick={() => toggle(0)}
                aria-checked={checked[0]}
                role="checkbox"
                aria-label="Manual CV and portfolio review by assigned recruiter"
              />
              <Box className={styles.checklistTextBlock}>
                <Typography component="p" className={styles.checklistTitle}>
                  Manual CV and portfolio review by assigned recruiter.
                </Typography>
                <Typography component="p" className={styles.checklistDesc}>
                  Confirm manual review completed for this candidate.
                </Typography>
              </Box>
            </Box>

            <Box className={styles.checklistItem}>
              <Box
                component="button"
                className={`${styles.checkbox} ${checked[1] ? styles.checkboxChecked : ''}`}
                onClick={() => toggle(1)}
                aria-checked={checked[1]}
                role="checkbox"
                aria-label="Email candidate about application progressing"
              />
              <Box className={styles.checklistTextBlock}>
                <Typography component="p" className={styles.checklistTitle}>
                  Email candidate: &ldquo;Your application is progressing&rdquo; with the link to the online assessment.
                </Typography>
                <Typography component="p" className={styles.checklistDesc}>
                  Email will be sent to this candidate.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Divider ── */}
          <Box className={styles.footerDivider} />

          {/* ── Action buttons ── */}
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.actionBtn} disableRipple disabled>
              Move back
            </ButtonBase>
            <ButtonBase className={styles.rejectBtn} disableRipple>
              Reject
            </ButtonBase>
            <ButtonBase className={styles.actionBtn} disableRipple disabled>
              Advance
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ScreeningStageModal
