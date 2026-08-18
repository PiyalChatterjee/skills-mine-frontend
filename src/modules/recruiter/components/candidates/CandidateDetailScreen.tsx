import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { recruiterCandidatesApi } from '@/services/api/recruiterCandidatesApi'
import type { CandidateListItem } from '@/types/api'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './CandidateDetailScreen.module.css'

// ── Stage badge colors ─────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  Interview:   '#7c5cd8',
  Shortlisted: '#2196a8',
  Screening:   '#2196a8',
  Inbound:     '#3aafb9',
  Assessment:  '#f59e0b',
  Offer:       '#4baf73',
  Placed:      '#2f9a5f',
  Closed:      '#d96b6b',
}

// ── Icons ──────────────────────────────────────────────────────────────

const BackArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M7.9993 8.666V13.3327L2.666 7.9993L7.9993 2.666V7.3327H13.3327V8.666H7.9993Z" fill="#B0B4B8" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const AiSparkleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M9.55385 16.7751C9.21645 17.5477 8.14721 17.5477 7.80985 16.7751L6.9322 14.7649C6.15116 12.9761 4.74534 11.5521 2.99175 10.7737L0.576033 9.70139C-0.192011 9.36049 -0.19201 8.24317 0.576033 7.90225L2.9163 6.86343C4.71498 6.06501 6.14602 4.5883 6.91372 2.73841L7.80275 0.596223C8.13264 -0.19874 9.23105 -0.198742 9.56095 0.596223L10.45 2.73843C11.2177 4.5883 12.6487 6.06501 14.4474 6.86343L16.7877 7.90225C17.5557 8.24317 17.5557 9.36049 16.7877 9.70139L14.372 10.7737C12.6184 11.5521 11.2126 12.9761 10.4315 14.7649L9.55385 16.7751ZM3.47901 8.80183C5.76485 9.81649 7.62347 11.4843 8.68183 13.7791C9.74025 11.4843 11.5989 9.81649 13.8847 8.80183C11.5716 7.77506 9.70705 6.02596 8.68184 3.69037C7.65664 6.02597 5.79212 7.77506 3.47901 8.80183ZM18.3409 21.6694L18.5877 21.1037C19.0277 20.0951 19.8202 19.292 20.809 18.8527L21.5694 18.5148C21.9807 18.3321 21.9807 17.7344 21.5694 17.5517L20.8516 17.2327C19.8373 16.7821 19.0306 15.9493 18.5981 14.9064L18.3447 14.2951C18.168 13.8691 17.579 13.8691 17.4023 14.2951L17.1489 14.9064C16.7165 15.9493 15.9098 16.7821 14.8955 17.2327L14.1776 17.5517C13.7664 17.7344 13.7664 18.3321 14.1776 18.5148L14.938 18.8527C15.9269 19.292 16.7193 20.0951 17.1593 21.1037L17.4062 21.6694C17.5868 22.0835 18.1602 22.0835 18.3409 21.6694ZM17.314 18.0264L17.8765 17.4678L18.4273 18.0264L17.8765 18.5693L17.314 18.0264Z" fill="#03478C" />
  </svg>
)

const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PreviewIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" aria-hidden="true">
    <path d="M16.031 14.6168L20.3137 18.8995L18.8995 20.3137L14.6168 16.031C13.0769 17.263 11.124 18 9 18C4.032 18 0 13.968 0 9C0 4.032 4.032 0 9 0C13.968 0 18 4.032 18 9C18 11.124 17.263 13.0769 16.031 14.6168ZM14.0247 13.8748C15.2475 12.6146 16 10.8956 16 9C16 5.1325 12.8675 2 9 2C5.1325 2 2 5.1325 2 9C2 12.8675 5.1325 16 9 16C10.8956 16 12.6146 15.2475 13.8748 14.0247L14.0247 13.8748Z" fill="#B0B4B8" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const UploadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#57606a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="#03478C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Derive a display document name from a CandidateListDocument.
 * Falls back to "docId.type" when no rich name is available.
 */
function docDisplayName(doc: { docId: string; type: string }): string {
  const typeMap: Record<string, string> = {
    CV: 'CV.doc',
    Degree: 'Degree.pdf',
    Portfolio: 'Portfolio.pdf',
    Certificate: 'Certificate.pdf',
    Other: 'Document',
  }
  return typeMap[doc.type] ?? doc.type
}

// ── Mock application data (keyed by stage appearance) ─────────────────
const MOCK_APPLICATIONS = [
  { jobTitle: 'UX/UI Designer', company: 'IBM',       stage: 'Interview',   color: '#7c5cd8' },
  { jobTitle: 'Graphic Designer', company: 'TymeBank', stage: 'Shortlisted', color: '#2196a8' },
  { jobTitle: 'Product Designer', company: 'Airbnb',   stage: 'Screening',   color: '#2196a8' },
]

// ── Main Component ─────────────────────────────────────────────────────

export const CandidateDetailScreen = () => {
  const navigate = useNavigate()
  const { candidateId } = useParams<{ candidateId: string }>()

  const [candidate, setCandidate] = useState<CandidateListItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    recruiterCandidatesApi
      .listCandidates()
      .then((envelope) => {
        if (cancelled) return
        const found = envelope.data.candidates.find(
          (c) => c.candidateId === candidateId,
        )
        if (found) {
          setCandidate(found)
        } else {
          setError('Candidate not found.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load candidate. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [candidateId])

  const goBack = () => navigate(ROUTE_PATHS.recruiterCandidates)

  // ── Loading ──
  if (loading) {
    return (
      <Box className={styles.pageRoot}>
        <Box className={styles.centeredState}>
          <CircularProgress size={32} />
        </Box>
      </Box>
    )
  }

  // ── Error / not found ──
  if (error || !candidate) {
    return (
      <Box className={styles.pageRoot}>
        <Box className={styles.breadcrumbBar}>
          <ButtonBase className={styles.backBtn} onClick={goBack} disableRipple>
            <BackArrowIcon /> Back
          </ButtonBase>
        </Box>
        <Box className={styles.centeredState}>
          <Typography color="error">{error ?? 'Candidate not found.'}</Typography>
        </Box>
      </Box>
    )
  }

  const initials = candidate.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Use documents from API; supplement with mock-named entries for display
  const docs = candidate.documents.length > 0
    ? candidate.documents
    : []

  return (
    <Box className={styles.pageRoot}>

      {/* ── Breadcrumb ── */}
      <Box className={styles.breadcrumbBar}>
        <ButtonBase className={styles.backBtn} onClick={goBack} disableRipple>
          <BackArrowIcon /> Back
        </ButtonBase>
        <ButtonBase className={styles.breadcrumbLink} onClick={goBack} disableRipple>
          Candidates
        </ButtonBase>
        <Box className={styles.breadcrumbArrow}><ChevronRightIcon /></Box>
        <Typography component="span" className={styles.breadcrumbCurrent}>
          {candidate.fullName}
        </Typography>
      </Box>

      {/* ── Hero card ── */}
      <Box className={styles.heroCard}>
        {/* Avatar */}
        <Box className={styles.avatarCircle} aria-label="Profile photo placeholder">
          <Typography component="span" className={styles.avatarInitials}>
            {initials}
          </Typography>
        </Box>

        {/* Info grid */}
        <Box className={styles.heroInfoCol}>
          <Box className={styles.heroInfoGrid}>
            {/* Left column */}
            <Box className={styles.heroInfoBlock}>
              <Typography component="p" className={styles.heroInfoLabel}>Full name</Typography>
              <Typography component="p" className={styles.heroInfoValue}>{candidate.fullName}</Typography>
            </Box>
            {/* Right column */}
            <Box className={styles.heroInfoBlock}>
              <Typography component="p" className={styles.heroInfoLabel}>Job title</Typography>
              <Typography component="p" className={styles.heroInfoValueDark}>{candidate.currentTitle}</Typography>
            </Box>

            {/* Left */}
            <Box className={styles.heroInfoBlock}>
              <Typography component="p" className={styles.heroInfoLabel}>Email address</Typography>
              <Typography component="p" className={styles.heroInfoValue}>{candidate.email}</Typography>
            </Box>
            {/* Right */}
            <Box className={styles.heroInfoBlock}>
              <Typography component="p" className={styles.heroInfoLabel}>Skills</Typography>
              <Box className={styles.skillsRow}>
                {candidate.skills.map((skill) => (
                  <Box key={skill} component="span" className={styles.skillChip}>
                    {skill}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Left */}
            <Box className={styles.heroInfoBlock}>
              <Typography component="p" className={styles.heroInfoLabel}>Phone number</Typography>
              <Typography component="p" className={styles.heroInfoValue}>{candidate.phone}</Typography>
            </Box>
            {/* Right — spacer so location aligns below phone */}
            <Box />

            {/* Left */}
            <Box className={styles.heroInfoBlock}>
              <Typography component="p" className={styles.heroInfoLabel}>Residential location</Typography>
              <Typography component="p" className={styles.heroInfoValue}>{candidate.location}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Two-column main content ── */}
      <Box className={styles.layout}>

        {/* ── Left column ── */}
        <Box className={styles.leftCol}>

          {/* AI Next Actions */}
          <Box className={styles.aiActionsSection}>
            <Box className={styles.aiActionsHeading}>
              <AiSparkleIcon />
              <Typography component="span" className={styles.aiLabel}>AI</Typography>
              <Typography component="span" className={styles.aiTitle}>
                Next Actions for this Candidate
              </Typography>
            </Box>
            <Box className={styles.aiActionBtns}>
              <ButtonBase className={styles.aiBtn} disableRipple>
                Send Latest Matched Jobs
              </ButtonBase>
              <ButtonBase className={styles.aiBtn} disableRipple>
                Send Outreach Email
              </ButtonBase>
            </Box>
          </Box>

          {/* Applications */}
          <Box className={styles.applicationsSection}>
            <Typography component="h2" className={styles.sectionTitle}>
              Applications
            </Typography>
            {MOCK_APPLICATIONS.map((app) => (
              <Box key={app.jobTitle + app.company} className={styles.applicationRow}>
                <Typography component="span" className={styles.appJobTitle}>
                  {app.jobTitle}
                </Typography>
                <Typography component="span" className={styles.appCompany}>
                  {app.company}
                </Typography>
                <Box
                  component="span"
                  className={styles.appStageBadge}
                  style={{ background: STAGE_COLORS[app.stage] ?? app.color }}
                >
                  {app.stage}
                </Box>
                <ButtonBase className={styles.appViewBtn} disableRipple>
                  View <ArrowRightIcon />
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Right column ── */}
        <Box className={styles.rightCol}>
          <Box className={styles.documentsSection}>
            <Typography component="h2" className={styles.sectionTitle}>
              Documents
            </Typography>

            {docs.map((doc) => (
              <Box key={doc.docId} className={styles.documentRow}>
                <DocIcon />
                <Typography component="span" className={styles.docName}>
                  {docDisplayName(doc)}
                </Typography>
                <Box className={styles.docActions}>
                  <ButtonBase className={styles.docActionBtn} disableRipple aria-label="Preview">
                    <PreviewIcon />
                  </ButtonBase>
                  <ButtonBase className={styles.docActionBtn} disableRipple aria-label="Download">
                    <DownloadIcon />
                  </ButtonBase>
                  <ButtonBase className={styles.docActionBtn} disableRipple aria-label="Delete">
                    <DeleteIcon />
                  </ButtonBase>
                </Box>
              </Box>
            ))}

            {/* Upload document row */}
            <Box className={styles.uploadRow} role="button" tabIndex={0} aria-label="Upload document">
              <UploadIcon />
              <Typography component="span" className={styles.uploadRowText}>
                Upload document
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateDetailScreen
