import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { moveCandidateToStage, addRecruiterNote } from '@/store/slices/recruiterPipelineSlice'
import { pushNotification } from '@/store/slices/notificationSlice'
import type { RootState } from '@/store'
import styles from './CandidateProfilePage.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const BackArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7.9993 8.666V13.3327L2.666 7.9993L7.9993 2.666V7.3327H13.3327V8.666H7.9993Z" fill="#B0B4B8"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M7 12l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const HoldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M10 8v8M14 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const NoteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────

const formatTimestamp = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
}

// ── Main Component ─────────────────────────────────────────────────────

const CandidateProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cardId, candidateId } = useParams<{ cardId: string; candidateId: string }>()

  const [noteText, setNoteText] = useState('')
  const [confirmAction, setConfirmAction] = useState<'screening' | 'reject' | null>(null)

  // ── Load from store ─────────────────────────────────────────────────
  const candidate = useSelector((state: RootState) =>
    state.recruiterPipeline.candidates.find(c => c.id === candidateId)
  )

  const mandate = useSelector((state: RootState) =>
    state.recruiterPipeline.mandates.find(m => m.id === cardId)
  )

  const RECRUITER_ID   = 'r1'
  const RECRUITER_NAME = 'Sarah Recruiter'

  // ── Actions ─────────────────────────────────────────────────────────

  const backToMandate = () => {
    const path = ROUTE_PATHS.recruiterMandate.replace(':cardId', cardId ?? '')
    navigate(path)
  }

  const handleMoveToScreening = () => {
    if (!candidate) return
    dispatch(moveCandidateToStage({
      candidateId: candidate.id,
      toStage: 'Screening',
      recruiterId: RECRUITER_ID,
      recruiterName: RECRUITER_NAME,
      note: 'Moved to Screening from Candidate Profile',
    }))
    dispatch(pushNotification({
      level: 'success',
      title: 'Moved to Screening',
      message: `${candidate.name} has been moved to the Screening stage.`,
    }))
    setConfirmAction(null)
    backToMandate()
  }

  const handleReject = () => {
    if (!candidate) return
    dispatch(moveCandidateToStage({
      candidateId: candidate.id,
      toStage: 'Closed',
      recruiterId: RECRUITER_ID,
      recruiterName: RECRUITER_NAME,
      note: 'Rejected at Inbound stage',
    }))
    dispatch(pushNotification({
      level: 'info',
      title: 'Candidate Rejected',
      message: `${candidate.name} has been moved to Closed – Rejected.`,
    }))
    setConfirmAction(null)
    backToMandate()
  }

  const handleKeepInbound = () => {
    dispatch(pushNotification({
      level: 'info',
      title: 'Kept in Inbound',
      message: `${candidate?.name} will remain in Inbound for further review.`,
    }))
    backToMandate()
  }

  const handleAddNote = () => {
    const trimmed = noteText.trim()
    if (!trimmed || !candidate) return
    dispatch(addRecruiterNote({
      candidateId: candidate.id,
      text: trimmed,
      recruiterId: RECRUITER_ID,
      recruiterName: RECRUITER_NAME,
    }))
    setNoteText('')
  }

  // ── Fallback ────────────────────────────────────────────────────────
  if (!candidate || !mandate) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <Box style={{ padding: '48px 32px', color: '#57606a' }}>
            Candidate not found.{' '}
            <ButtonBase onClick={backToMandate} disableRipple style={{ color: '#03478C', textDecoration: 'underline' }}>
              Back to Mandate
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>

        {/* ── Breadcrumb ── */}
        <Box className={styles.breadcrumbBar}>
          <ButtonBase className={styles.backBtn} onClick={backToMandate} disableRipple>
            <BackArrowIcon /> Back
          </ButtonBase>
          <Box className={styles.breadcrumbDivider} />
          <ButtonBase className={styles.breadcrumbLink} onClick={() => navigate(ROUTE_PATHS.recruiter)} disableRipple>
            Mandates
          </ButtonBase>
          <Box className={styles.breadcrumbArrow}><ChevronRightIcon /></Box>
          <ButtonBase className={styles.breadcrumbLink} onClick={backToMandate} disableRipple>
            {mandate.title}
          </ButtonBase>
          <Box className={styles.breadcrumbArrow}><ChevronRightIcon /></Box>
          <Typography component="span" className={styles.breadcrumbCurrent}>
            {candidate.name}
          </Typography>
          <Box component="span" className={styles.stageBadge}>{candidate.currentStage}</Box>
        </Box>

        <Box className={styles.layout}>

          {/* ── Left: CV & Profile ── */}
          <Box className={styles.leftCol}>

            {/* Candidate header card */}
            <Box className={styles.profileCard}>
              <Box className={styles.avatarCircle}>
                {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </Box>
              <Box className={styles.profileInfo}>
                <Typography component="h1" className={styles.profileName}>{candidate.name}</Typography>
                <Typography component="p" className={styles.profileTitle}>{candidate.title}</Typography>
                <Box className={styles.profileMeta}>
                  <Typography component="span" className={styles.profileMetaItem}>{candidate.email}</Typography>
                  <Typography component="span" className={styles.profileMetaItem}>{candidate.phone}</Typography>
                  <Typography component="span" className={styles.profileMetaItem}>{candidate.location}</Typography>
                </Box>
              </Box>
              <Box className={styles.matchBadge}>
                <Typography component="p" className={styles.matchScore}>{candidate.matchScore}%</Typography>
                <Typography component="p" className={styles.matchLabel}>Match</Typography>
              </Box>
            </Box>

            {/* CV Summary */}
            <Box className={styles.sectionCard}>
              <Typography component="h2" className={styles.sectionTitle}>CV Summary</Typography>
              <Typography component="p" className={styles.sectionBody}>{candidate.cvSummary}</Typography>
            </Box>

            {/* Experience */}
            <Box className={styles.sectionCard}>
              <Typography component="h2" className={styles.sectionTitle}>Experience</Typography>
              <Typography component="p" className={styles.sectionBody}>{candidate.experience}</Typography>
            </Box>

            {/* Education */}
            <Box className={styles.sectionCard}>
              <Typography component="h2" className={styles.sectionTitle}>Education</Typography>
              <Typography component="p" className={styles.sectionBody}>{candidate.education}</Typography>
            </Box>

            {/* Skills */}
            <Box className={styles.sectionCard}>
              <Typography component="h2" className={styles.sectionTitle}>Skills</Typography>
              <Box className={styles.skillsList}>
                {candidate.skills.map(skill => (
                  <Box key={skill} component="span" className={styles.skillChip}>{skill}</Box>
                ))}
              </Box>
            </Box>

            {/* Stage history */}
            <Box className={styles.sectionCard}>
              <Typography component="h2" className={styles.sectionTitle}>Stage History</Typography>
              <Box className={styles.historyList}>
                {candidate.stageHistory.map((entry, idx) => (
                  <Box key={idx} className={styles.historyItem}>
                    <Box className={styles.historyDot} />
                    <Box className={styles.historyContent}>
                      <Typography component="p" className={styles.historyStage}>
                        {entry.from} → {entry.to}
                      </Typography>
                      <Typography component="p" className={styles.historyMeta}>
                        {formatTimestamp(entry.timestamp)} · {entry.recruiterName}
                        {entry.note ? ` · ${entry.note}` : ''}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* ── Right: Actions & Notes ── */}
          <Box className={styles.rightCol}>

            {/* Action buttons */}
            <Box className={styles.actionsCard}>
              <Typography component="h2" className={styles.actionsTitle}>Recruiter Actions</Typography>

              <ButtonBase
                className={`${styles.actionBtn} ${styles.actionBtnScreening}`}
                onClick={() => setConfirmAction('screening')}
                disableRipple
              >
                <CheckCircleIcon /> Move to Screening
              </ButtonBase>

              <ButtonBase
                className={`${styles.actionBtn} ${styles.actionBtnReject}`}
                onClick={() => setConfirmAction('reject')}
                disableRipple
              >
                <XCircleIcon /> Reject Candidate
              </ButtonBase>

              <ButtonBase
                className={`${styles.actionBtn} ${styles.actionBtnHold}`}
                onClick={handleKeepInbound}
                disableRipple
              >
                <HoldIcon /> Keep in Inbound
              </ButtonBase>
            </Box>

            {/* Confirm dialog inline */}
            {confirmAction && (
              <Box className={styles.confirmCard}>
                <Typography component="p" className={styles.confirmText}>
                  {confirmAction === 'screening'
                    ? `Move ${candidate.name} to Screening?`
                    : `Reject ${candidate.name} and close the application?`
                  }
                </Typography>
                <Box className={styles.confirmBtns}>
                  <ButtonBase
                    className={styles.confirmYes}
                    onClick={confirmAction === 'screening' ? handleMoveToScreening : handleReject}
                    disableRipple
                  >
                    Confirm
                  </ButtonBase>
                  <ButtonBase
                    className={styles.confirmNo}
                    onClick={() => setConfirmAction(null)}
                    disableRipple
                  >
                    Cancel
                  </ButtonBase>
                </Box>
              </Box>
            )}

            {/* Recruiter Notes */}
            <Box className={styles.notesCard}>
              <Typography component="h2" className={styles.actionsTitle}>
                <NoteIcon /> Recruiter Notes
              </Typography>

              {candidate.recruiterNotes.length === 0 && (
                <Typography component="p" className={styles.notesEmpty}>No notes yet.</Typography>
              )}

              <Box className={styles.notesList}>
                {candidate.recruiterNotes.map(note => (
                  <Box key={note.id} className={styles.noteItem}>
                    <Typography component="p" className={styles.noteText}>{note.text}</Typography>
                    <Typography component="p" className={styles.noteMeta}>
                      {formatTimestamp(note.timestamp)} · {note.recruiterName}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box className={styles.noteInputRow}>
                <textarea
                  className={styles.noteInput}
                  placeholder="Add a note…"
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  rows={3}
                />
                <ButtonBase
                  className={styles.noteSendBtn}
                  onClick={handleAddNote}
                  disableRipple
                  aria-label="Add note"
                >
                  <SendIcon />
                </ButtonBase>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateProfilePage
