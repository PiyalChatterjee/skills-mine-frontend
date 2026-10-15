import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { mandateApi, type StageHistoryItem } from '@/services/api/mandateApi'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './CandidateHistoryModal.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" stroke="#57606a" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const PersonIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="#ffffff" strokeWidth="1.8"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

// ── Stage dot colour map ────────────────────────────────────────────────

const STAGE_DOT_COLOR: Record<string, string> = {
  INBOUND:    '#F0CB89',
  SCREENING:  '#AF9EDD',
  ASSESSMENT: '#F5DE6F',
  SHORTLIST:  '#DD93BA',
  INTERVIEW:  '#7CB0B9',
  OFFER:      '#6FBF8F',
  CLOSED:     '#DBEFE3',
  REJECT:     '#D64545',
  REJECTED:   '#D64545',
}

const STAGE_LABEL: Record<string, string> = {
  INBOUND:    'Applied',
  SCREENING:  'Screened',
  ASSESSMENT: 'Assessed',
  SHORTLIST:  'Shortlist',
  INTERVIEW:  'Interview Scheduled',
  OFFER:      'Offer Extended',
  CLOSED:     'Closed',
  REJECT:     'Rejected',
  REJECTED:   'Rejected',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function stageLabel(code: string): string {
  return STAGE_LABEL[code?.toUpperCase()] ?? code
}

function stageDot(code: string): string {
  return STAGE_DOT_COLOR[code?.toUpperCase()] ?? '#9ca3af'
}

// ── Props ──────────────────────────────────────────────────────────────

export interface CandidateHistoryModalProps {
  candidateName: string
  candidateTitle: string
  applicationId: string
  candidateId?: string
  onClose: () => void
  onViewProfile?: () => void
}

// ── Component ──────────────────────────────────────────────────────────

const CandidateHistoryModal = ({
  candidateName,
  candidateTitle,
  applicationId,
  candidateId,
  onClose,
  onViewProfile,
}: CandidateHistoryModalProps) => {
  const navigate = useNavigate()
  const [history, setHistory] = useState<StageHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    mandateApi
      .getApplicationStageHistory(applicationId)
      .then(data => setHistory(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [applicationId])

  // Resolve the ID to navigate with: prefer candidateId, fall back to visitorId from history
  const resolvedProfileId =
    candidateId ||
    history.find(h => h.applicant?.candidateId)?.applicant?.candidateId ||
    history.find(h => h.applicant?.visitorId)?.applicant?.visitorId ||
    null

  return (
    <Box className={styles.backdrop} onClick={onClose}>
      <Box
        className={styles.modal}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Candidate history for ${candidateName}`}
      >
        {/* ── Header row ── */}
        <Box className={styles.headerRow}>
          <Typography component="h2" className={styles.title}>
            Candidate History
          </Typography>
          <ButtonBase className={styles.closeBtn} onClick={onClose} disableRipple aria-label="Close">
            <CloseIcon />
          </ButtonBase>
        </Box>

        {/* ── Divider ── */}
        <Box className={styles.divider} />

        {/* ── Candidate info ── */}
        <Box className={styles.candidateRow}>
          <Box className={styles.avatar}>
            <PersonIcon />
          </Box>
          <Box className={styles.candidateInfo}>
            <Typography component="p" className={styles.candidateName}>
              {candidateName}
            </Typography>
            <Typography component="p" className={styles.candidateTitle}>
              {candidateTitle}
            </Typography>
          </Box>
        </Box>

        {/* ── Divider ── */}
        <Box className={styles.divider} />

        {/* ── Timeline ── */}
        <Box className={styles.timeline}>
          {loading && (
            <Box className={styles.loadingBox}>
              <CircularProgress size={24} sx={{ color: '#1E5FA8' }} />
            </Box>
          )}
          {!loading && error && (
            <Typography component="p" className={styles.errorText}>
              Failed to load history.
            </Typography>
          )}
          {!loading && !error && history.length === 0 && (
            <Typography component="p" className={styles.emptyText}>
              No stage history available.
            </Typography>
          )}
          {!loading && !error && history.map((item) => (
            <Box key={item.stageHistoryId} className={styles.timelineEntry}>
              <Typography component="p" className={styles.entryDate}>
                {formatDate(item.changedAt)}
              </Typography>
              <Box className={styles.entryStageRow}>
                <Box
                  className={styles.stageDot}
                  style={{ background: stageDot(item.toStageCode) }}
                />
                <Typography component="p" className={styles.stageLabel}>
                  {stageLabel(item.toStageCode)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── Footer ── */}
        <Box className={styles.footer}>
          <Box className={styles.footerDivider} />
          <Box className={styles.actionRow}>
            <ButtonBase className={styles.closeOutlineBtn} onClick={onClose} disableRipple>
              Close
            </ButtonBase>
            <ButtonBase
              className={styles.viewProfileBtn}
              onClick={() => {
                if (onViewProfile) {
                  onViewProfile()
                } else if (resolvedProfileId) {
                  navigate(ROUTE_PATHS.recruiterCandidateDetail.replace(':candidateId', resolvedProfileId))
                  onClose()
                }
              }}
              disableRipple
              disabled={!onViewProfile && !resolvedProfileId}
            >
              View Profile
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateHistoryModal
