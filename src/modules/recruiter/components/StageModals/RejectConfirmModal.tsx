import { PipelineStageCode, PipelineStageLabel as PipelineLabel } from "@/enums/statuses";
import { useState } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { mandateApi } from '@/services/api/mandateApi'
import styles from './RejectConfirmModal.module.css'

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

const RejectCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="#E05252"/>
    <path d="M15 9l-6 6M9 9l6 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// ── Props ──────────────────────────────────────────────────────────────

export interface RejectConfirmModalProps {
  stageName: string
  candidateName: string
  candidateTitle: string
  company: string
  applicationId: string
  jobId: string
  dueDate?: string
  onClose: () => void
  onRejected?: (applicationId: string) => void
}

// ── Component ──────────────────────────────────────────────────────────

const RejectConfirmModal = ({
  stageName,
  candidateName,
  candidateTitle,
  company,
  applicationId,
  jobId,
  dueDate = 'Jan 20, 2026',
  onClose,
  onRejected,
}: RejectConfirmModalProps) => {
  const [submitting, setSubmitting] = useState(false)

  const handleDone = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await mandateApi.advanceJobStage(jobId, {
        applicationId: [applicationId],
        toStageCode: stageName === PipelineLabel.OFFER ? PipelineStageCode.OFFER_REJECT : PipelineStageCode.REJECT,
      })
      onRejected?.(applicationId)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Reject ${candidateName}`}
      >
        {/* ── Close button ── */}
        <Box className={styles.closeBtnRow}>
          <ButtonBase className={styles.closeBtn} onClick={onClose} disableRipple aria-label="Close">
            <CloseIcon />
          </ButtonBase>
        </Box>

        {/* ── Stage banner ── */}
        <Box className={styles.stageBanner}>
          <Typography component="h2" className={styles.stageBannerText}>
            {stageName}
          </Typography>
        </Box>

        {/* ── Content ── */}
        <Box className={styles.content}>
          <Typography component="h3" className={styles.candidateName}>
            {candidateName}
          </Typography>
          <Typography component="p" className={styles.jobInfo}>
            {candidateTitle}, {company}
          </Typography>
          <Box className={styles.dueDateRow}>
            <CalendarIcon />
            <Typography component="span" className={styles.dueDate}>
              Due {dueDate}
            </Typography>
          </Box>

          {/* ── Rejected status pill ── */}
          <Box className={styles.rejectedPill}>
            <RejectCircleIcon />
            <Typography component="span" className={styles.rejectedLabel}>
              Rejected
            </Typography>
          </Box>

          {/* ── Divider ── */}
          <Box className={styles.footerDivider} />

          {/* ── Action buttons ── */}
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.cancelBtn} onClick={onClose} disableRipple>
              Cancel
            </ButtonBase>
            <ButtonBase className={styles.doneBtn} onClick={handleDone} disableRipple disabled={submitting}>
              {submitting ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Done'}
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default RejectConfirmModal
