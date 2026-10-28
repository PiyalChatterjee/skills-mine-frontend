import { PipelineStageCode, PipelineStageLabel as PipelineLabel } from "@/enums/statuses";
import { useState } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { mandateApi } from '@/services/api/mandateApi'
import RejectConfirmModal from './RejectConfirmModal'
import styles from './AssessmentStageModal.module.css'

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

export interface AssessmentStageModalProps {
  candidateName: string
  candidateTitle: string
  company: string
  applicationId: string
  jobId: string
  dueDate?: string
  isRejected?: boolean
  isMoveLocked?: boolean
  onClose: () => void
  onAdvance?: (applicationId: string) => void
  onMoveBack?: (applicationId: string) => void
  onRejected?: (applicationId: string) => void
}

// ── Component ──────────────────────────────────────────────────────────

const AssessmentStageModal = ({
  candidateName,
  candidateTitle,
  company,
  applicationId,
  jobId,
  dueDate = 'Jan 20, 2026',
  isRejected = false,
  isMoveLocked = false,
  onClose,
  onAdvance,
  onMoveBack,
  onRejected,
}: AssessmentStageModalProps) => {
  const [checked, setChecked]     = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [movingBack, setMovingBack] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const handleMoveBack = async () => {
    if (movingBack) return
    setMovingBack(true)
    try {
      await mandateApi.advanceJobStage(jobId, {
        applicationId: [applicationId],
        toStageCode: PipelineStageCode.SCREENING,
      })
      onMoveBack?.(applicationId)
      onClose()
    } finally {
      setMovingBack(false)
    }
  }

  const handleAdvance = async () => {
    if (!checked || advancing) return
    setAdvancing(true)
    try {
      await mandateApi.advanceJobStage(jobId, {
        applicationId: [applicationId],
        toStageCode: PipelineStageCode.SHORTLIST,
      })
      onAdvance?.(applicationId)
      onClose()
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <>
    {!rejectOpen && <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Assessment stage details for ${candidateName}`}
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
            Assessment
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
            <Box className={`${styles.checklistItem} ${checked ? styles.checklistItemChecked : ''}`}>
              <Box
                component="button"
                className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`}
                onClick={() => setChecked(v => !v)}
                aria-checked={checked}
                role="checkbox"
                aria-label="Send informational interview booking link to above candidate"
              />
              <Box className={styles.checklistTextBlock}>
                <Typography component="p" className={styles.checklistTitle}>
                  Send informational interview booking link to above candidate.
                </Typography>
                <Typography component="p" className={styles.checklistDesc}>
                  Email will be sent to this candidate.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Offline email notice ── */}
          <Box className={styles.offlineNotice} role="status">
            <Typography component="p" className={styles.offlineNoticeText}>
              Recruiter needs to send the email to the candidate offline.
            </Typography>
          </Box>

          {/* ── Divider ── */}
          <Box className={styles.footerDivider} />

          {/* ── Action buttons ── */}
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.moveBackBtn} disableRipple onClick={handleMoveBack} disabled={movingBack || isRejected || isMoveLocked}>
              {movingBack ? <CircularProgress size={14} sx={{ color: '#1E5FA8' }} /> : 'Move back'}
            </ButtonBase>
            <ButtonBase className={styles.rejectBtn} disableRipple onClick={() => setRejectOpen(true)} disabled={isRejected}>
              Reject
            </ButtonBase>
            <ButtonBase
              className={`${styles.actionBtn} ${checked && !isRejected && !isMoveLocked ? styles.actionBtnActive : ''}`}
              disableRipple
              disabled={!checked || advancing || isRejected || isMoveLocked}
              onClick={handleAdvance}
            >
              {advancing ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : 'Advance'}
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>}
      {rejectOpen && (
        <RejectConfirmModal
          stageName={PipelineLabel.ASSESSMENT}
          candidateName={candidateName}
          candidateTitle={candidateTitle}
          company={company}
          applicationId={applicationId}
          jobId={jobId}
          dueDate={dueDate}
          onClose={() => setRejectOpen(false)}
          onRejected={onRejected}
        />
      )}
    </>
  )
}

export default AssessmentStageModal
