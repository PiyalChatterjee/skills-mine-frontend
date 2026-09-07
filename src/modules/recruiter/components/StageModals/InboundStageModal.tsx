import { useState } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { mandateApi } from '@/services/api/mandateApi'
import styles from './InboundStageModal.module.css'

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

export interface InboundStageModalProps {
  candidateName: string
  candidateTitle: string
  company: string
  applicationId: string
  jobId: string
  dueDate?: string
  onClose: () => void
  /** Called after the card has been successfully advanced to Screening */
  onAdvance?: (applicationId: string) => void
}

// ── Component ──────────────────────────────────────────────────────────

const InboundStageModal = ({
  candidateName,
  candidateTitle,
  company,
  applicationId,
  jobId,
  dueDate = 'Jan 20, 2026',
  onClose,
  onAdvance,
}: InboundStageModalProps) => {
  const [checked, setChecked]   = useState(false)
  const [advancing, setAdvancing] = useState(false)

  const handleAdvance = async () => {
    if (!checked || advancing) return
    setAdvancing(true)
    try {
      await mandateApi.advanceJobStage(jobId, {
        applicationIds: [applicationId],
        targetStage: 'Screening',
      })
      onAdvance?.(applicationId)
      onClose()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Inbound stage details for ${candidateName}`}
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
            Inbound
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

          {/* ── Checklist ── */}
          <Box className={styles.checklist}>
            <Box className={styles.checklistItem}>
              <Box
                component="button"
                className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}
                onClick={() => setChecked(v => !v)}
                aria-checked={checked}
                role="checkbox"
                aria-label="CV uploaded and OCR'd"
              />
              <Box className={styles.checklistTextBlock}>
                <Typography component="p" className={styles.checklistTitle}>
                  CV uploaded and OCR&apos;d
                </Typography>
                <Typography component="p" className={styles.checklistDesc}>
                  Verify candidate has had their CV uploaded and processed.
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
            <ButtonBase
              className={`${styles.actionBtn} ${checked ? styles.actionBtnActive : ''}`}
              disableRipple
              disabled={!checked || advancing}
              onClick={handleAdvance}
            >
              {advancing ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Advance'}
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default InboundStageModal
