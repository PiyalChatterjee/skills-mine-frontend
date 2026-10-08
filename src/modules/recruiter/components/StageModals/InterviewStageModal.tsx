import { useState } from 'react'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { mandateApi } from '@/services/api/mandateApi'
import RejectConfirmModal from './RejectConfirmModal'
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
  applicationId: string
  jobId: string
  dueDate?: string
  onClose: () => void
  onAdvance?: (applicationId: string) => void
  onMoveBack?: (applicationId: string) => void
  onRejected?: (applicationId: string) => void
}

// ── Component ──────────────────────────────────────────────────────────

const InterviewStageModal = ({
  candidateName,
  candidateTitle,
  company,
  applicationId,
  jobId,
  dueDate = 'Jan 20, 2026',
  onClose,
  onAdvance,
  onMoveBack,
  onRejected,
}: InterviewStageModalProps) => {
  const [notes, setNotes]         = useState(
    ''
  )
  const [advancing, setAdvancing] = useState(false)
  const [movingBack, setMovingBack] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)

  const canAdvance = notes.trim().length > 0

  const handleMoveBack = async () => {
    if (movingBack) return
    setMovingBack(true)
    try {
      await mandateApi.advanceJobStage(jobId, {
        applicationId: [applicationId],
        toStageCode: 'SHORTLISTED',
      })
      onMoveBack?.(applicationId)
      onClose()
    } finally {
      setMovingBack(false)
    }
  }

  const handleAdvance = async () => {
    if (!canAdvance || advancing) return
    setAdvancing(true)
    try {
      await mandateApi.advanceJobStage(jobId, {
        applicationId: [applicationId],
        toStageCode: 'OFFER',
        notes,
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
            <ButtonBase className={styles.moveBackBtn} disableRipple onClick={handleMoveBack} disabled={movingBack}>
              {movingBack ? <CircularProgress size={14} sx={{ color: '#1E5FA8' }} /> : 'Move back'}
            </ButtonBase>
            <ButtonBase className={styles.rejectBtn} disableRipple onClick={() => setRejectOpen(true)}>
              Reject
            </ButtonBase>
            <ButtonBase
              className={`${styles.advanceBtn} ${!canAdvance ? styles.advanceBtnDisabled : ''}`}
              disableRipple
              disabled={!canAdvance || advancing}
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
          stageName="Interview"
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

export default InterviewStageModal
