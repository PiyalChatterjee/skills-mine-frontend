import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { UploadDocumentModal } from './UploadDocumentModal'
import { recruiterCandidatesApi } from '@/services/api/recruiterCandidatesApi'
import type {
  CandidateDashboardApplicationItem,
  CandidateDocument,
  RecruiterCandidateProfile,
} from '@/services/api/recruiterCandidatesApi'
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
    <path d="M9.55385 16.7751C9.21645 17.5477 8.14721 17.5477 7.80985 16.7751L6.9322 14.7649C6.15116 12.9761 4.74534 11.5521 2.99175 10.7737L0.576033 9.70139C-0.192011 9.36049 -0.19201 8.24317 0.576033 7.90225L2.9163 6.86343C4.71498 6.06501 6.14602 4.5883 6.91372 2.73841L7.80275 0.596223C8.13264 -0.19874 9.23105 -0.198742 9.56095 0.596223L10.45 2.73843C11.2177 4.5883 12.6487 6.06501 14.4474 6.86343L16.7877 7.90225C17.5557 8.24317 17.5557 9.36049 16.7877 9.70139L14.372 10.7737C12.6184 11.5521 11.2126 12.9761 10.4315 14.7649L9.55385 16.7751ZM3.47901 8.80183C5.76485 9.81649 7.62347 11.4843 8.68183 13.7791C9.74025 11.4843 11.5989 9.81649 13.8847 8.80183C11.5716 7.77506 9.70705 6.02596 8.68184 3.69037C7.65664 6.02597 5.79212 7.77506 3.47901 8.80183ZM18.3409 21.6694L18.5877 21.1037C19.0277 20.0951 19.8202 19.292 20.809 18.8527L21.5694 18.5148C21.9807 18.3321 21.9807 17.7344 21.5694 17.5517L20.8516 17.2327C19.8373 16.7821 19.0306 15.9493 18.5981 14.9064L18.3447 14.2951C18.168 13.8691 17.579 13.8691 17.4023 14.2951L17.1489 14.9064C16.7165 15.9493 15.9098 16.7821 14.8955 17.2327L14.1776 17.5517C13.7664 17.7344 13.7664 18.3321 14.1776 18.5148L14.938 18.8527C15.9269 19.292 16.7193 20.0951 17.1593 21.1037L17.4062 21.6694C17.5868 22.0835 18.1602 22.0835 18.3409 21.6694ZM17.314 18.0264L17.8765 17.4678L18.4273 18.0264L17.8765 18.5693L17.314 18.0264Z" fill="#80C0E8" />
  </svg>
)

const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

const LongArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="#03478C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PreviewIcon = () => (
  <svg width="19" height="19" viewBox="0 0 21 21" fill="none" aria-hidden="true">
    <path d="M16.031 14.6168L20.3137 18.8995L18.8995 20.3137L14.6168 16.031C13.0769 17.263 11.124 18 9 18C4.032 18 0 13.968 0 9C0 4.032 4.032 0 9 0C13.968 0 18 4.032 18 9C18 11.124 17.263 13.0769 16.031 14.6168ZM14.0247 13.8748C15.2475 12.6146 16 10.8956 16 9C16 5.1325 12.8675 2 9 2C5.1325 2 2 5.1325 2 9C2 12.8675 5.1325 16 9 16C10.8956 16 12.6146 15.2475 13.8748 14.0247L14.0247 13.8748ZM10.1779 5.17624C9.4834 5.48982 9 6.18846 9 7C9 8.1046 9.8954 9 11 9C11.8115 9 12.5102 8.5166 12.8238 7.82212C12.9383 8.1945 13 8.59 13 9C13 11.2091 11.2091 13 9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C9.41 5 9.8055 5.06167 10.1779 5.17624Z" fill="#B0B4B8"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#b0b4b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM18 8H6V20H18V8ZM9 11H11V17H9V11ZM13 11H15V17H13V11ZM9 4V6H15V4H9Z" fill="#b0b4b8"/>
  </svg>
)

// ── Main Component ─────────────────────────────────────────────────────

export const CandidateDetailScreen = () => {
  const navigate = useNavigate()
  const { candidateId } = useParams<{ candidateId: string }>()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [candidate, setCandidate] = useState<RecruiterCandidateProfile | null>(null)
  const [applications, setApplications] = useState<CandidateDashboardApplicationItem[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [documents, setDocuments] = useState<CandidateDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [confirmDeleteDocumentId, setConfirmDeleteDocumentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [profileImagePreviewOpen, setProfileImagePreviewOpen] = useState(false)

  useEffect(() => {
    if (!candidateId) return
    let cancelled = false

    setLoading(true)
    setError(null)

    // Load candidate profile
    recruiterCandidatesApi
      .getCandidateProfile(candidateId)
      .then((profile) => {
        if (!cancelled) setCandidate(profile)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load candidate. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // Load candidate dashboard applications (GET /candidates/dashboard/:candidateId)
    setApplicationsLoading(true)
    recruiterCandidatesApi
      .getCandidateDashboard(candidateId)
      .then((res) => {
        if (!cancelled) setApplications(res.applications ?? [])
      })
      .catch(() => {
        if (!cancelled) setApplications([])
      })
      .finally(() => {
        if (!cancelled) setApplicationsLoading(false)
      })

    // Load documents (GET /documents/owner/CANDIDATE/:candidateId)
    setDocumentsLoading(true)
    recruiterCandidatesApi
      .getDocumentsByOwner('CANDIDATE', candidateId)
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch(() => {
        if (!cancelled) setDocuments([])
      })
      .finally(() => {
        if (!cancelled) setDocumentsLoading(false)
      })

    // Load profile image (GET /documents/owner/CANDIDATE/:candidateId?document_type=IDENTITY_DOCUMENT)
    recruiterCandidatesApi
      .getDocumentsByOwner('CANDIDATE', candidateId, 'IDENTITY_DOCUMENT')
      .then((docs) => {
        if (cancelled) return
        const imageDoc = docs[0]
        if (!imageDoc) return
        return recruiterCandidatesApi.fetchDocumentPresignedUrl(imageDoc.documentId, 'inline')
      })
      .then((url) => {
        if (!cancelled && url) setProfileImageUrl(url)
      })
      .catch(() => { /* profile image is non-critical — silently ignore */ })

    return () => { cancelled = true }
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
          {profileImageUrl ? (
            <ButtonBase
              disableRipple
              aria-label="Preview profile photo"
              onClick={() => setProfileImagePreviewOpen(true)}
              sx={{ width: '100%', height: '100%', borderRadius: '50%', cursor: 'pointer' }}
            >
              <Box
                component="img"
                src={profileImageUrl}
                alt={candidate.fullName}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            </ButtonBase>
          ) : (
            <Typography component="span" className={styles.avatarInitials}>
              {initials}
            </Typography>
          )}
        </Box>

        {/* ── Profile image preview dialog ── */}
        <Dialog
          open={profileImagePreviewOpen}
          onClose={() => setProfileImagePreviewOpen(false)}
          maxWidth="md"
          aria-labelledby="profile-image-preview-title"
          slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.75)' } } }}
        >
          <DialogContent sx={{ p: 0, lineHeight: 0, position: 'relative' }}>
            <ButtonBase
              disableRipple
              aria-label="Close preview"
              onClick={() => setProfileImagePreviewOpen(false)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 1,
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.45)',
                color: '#fff',
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ✕
            </ButtonBase>
            <Box
              component="img"
              src={profileImageUrl ?? ''}
              alt={candidate.fullName}
              sx={{ display: 'block', maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain' }}
            />
          </DialogContent>
        </Dialog>

        {/* Info grid — 3 columns: left | middle | right  matching the UI */}
        <Box className={styles.heroInfoCol}>
          <Box className={styles.heroInfoGrid3}>

            {/* ── Column 1 ── */}
            <Box className={styles.heroInfoColGroup}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Full Name</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.fullName || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Email Address</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.email || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Phone Number</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.phone || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Residential Location</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.location || '—'}</Typography>
              </Box>
            </Box>

            {/* ── Column 2 ── */}
            <Box className={styles.heroInfoColGroup}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Alternative Email Address</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.alternateEmail || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Alternative Phone Number</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.alternatePhone || '—'}</Typography>
              </Box>
            </Box>

            {/* ── Column 3 ── */}
            <Box className={styles.heroInfoColGroup}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Job Title</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.currentTitle || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Skills</Typography>
                {candidate.skills.length > 0 ? (
                  <Box className={styles.skillsRow}>
                    {candidate.skills.slice(0, 6).map((skill) => (
                      <Box key={skill} component="span" className={styles.skillChip}>
                        {skill}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography component="p" className={styles.heroInfoValue}>—</Typography>
                )}
              </Box>
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
              <Typography component="span" className={styles.aiTitle}>
                Next Actions for this Candidate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <AiSparkleIcon  />
              </Box>
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

          {/* Applications Section */}
          <Box className={styles.applicationsSection}>
            <Typography component="h2" className={styles.sectionTitle}>
              Applications
            </Typography>
            {applicationsLoading ? (
              <Box className={styles.centeredState} sx={{ minHeight: 80 }}>
                <CircularProgress size={24} />
              </Box>
            ) : applications.length === 0 ? (
              <Typography sx={{ color: '#57606a', fontSize: 13, py: 1 }}>
                No applications found for this candidate.
              </Typography>
            ) : (
              applications.map((app) => (
                <Box key={app.applicationId} className={styles.applicationRow}>
                  <Typography component="span" className={styles.appJobTitle}>
                    {app.jobTitle || '—'}
                  </Typography>
                  <Typography component="span" className={styles.appCompany}>
                    {app.company || '—'}
                  </Typography>
                  <Box
                    component="span"
                    className={styles.appStageBadge}
                    style={{ background: STAGE_COLORS[app.currentStage] ?? '#7c5cd8' }}
                  >
                    {app.currentStage}
                  </Box>
                  <ButtonBase
                    className={styles.appViewBtn}
                    disableRipple
                    onClick={() => {
                      if (app.jobProfileId) {
                        navigate(
                          ROUTE_PATHS.recruiterCandidateJobDetail
                            .replace(':candidateId', candidateId!)
                            .replace(':jobProfileId', app.jobProfileId)
                        )
                      }
                    }}
                  >
                    View <ArrowRightIcon />
                  </ButtonBase>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* ── Right column ── */}
        <Box className={styles.rightCol}>

          {/* Review & Edit CV */}
          <Box className={styles.reviewCvCard}>
            <Typography component="h2" className={styles.sectionTitle}>
              Review &amp; Edit CV
            </Typography>
            <ButtonBase
              className={styles.reviewCvButton}
              disableRipple
              onClick={() =>
                navigate(
                  ROUTE_PATHS.recruiterCandidateCvReview.replace(
                    ':candidateId',
                    candidateId!,
                  ),
                )
              }
            >
              <Typography component="span" className={styles.reviewCvText}>
                {candidate.fullName} CV
              </Typography>
              <Box className={styles.reviewCvArrow}>
                <LongArrowRightIcon />
              </Box>
            </ButtonBase>
          </Box>

          {/* Uploaded Documents */}
          <Box className={styles.documentsSection}>
            <Typography component="h2" className={styles.sectionTitle}>
              Uploaded Documents
            </Typography>

            {documentsLoading ? (
              <Box className={styles.centeredState} sx={{ minHeight: 60 }}>
                <CircularProgress size={24} />
              </Box>
            ) : documents.length === 0 ? (
              <Typography sx={{ color: '#57606a', fontSize: 13, py: 1 }}>
                No documents uploaded for this candidate.
              </Typography>
            ) : (
              documents.map((doc) => {
                const displayName = doc.title || doc.fileName

                const isWordDocument =
                  doc.mediaType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  doc.mediaType === 'application/msword' ||
                  /\.(docx?)\s*$/i.test(doc.fileName)

                const openDocument = (forDownload: boolean) => {
                  recruiterCandidatesApi
                    .fetchDocumentPresignedUrl(doc.documentId, forDownload ? 'attachment' : 'inline')
                    .then((presignedUrl) => {
                      const a = document.createElement('a')
                      // For Word files opened as preview, route through Microsoft Office Online
                      // viewer so the browser can render the document instead of downloading it.
                      if (!forDownload && isWordDocument) {
                        a.href = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(presignedUrl)}`
                      } else {
                        a.href = presignedUrl
                      }
                      if (forDownload) {
                        a.download = displayName
                      } else {
                        a.target = '_blank'
                        a.rel = 'noopener noreferrer'
                      }
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                    })
                }

                return (
                  <Box key={doc.documentId} className={styles.documentRow}>
                    <DocIcon />
                    <Typography component="span" className={styles.docName}>
                      {displayName}
                    </Typography>
                    <Box className={styles.docActions}>
                      <ButtonBase
                        className={styles.docActionBtn}
                        disableRipple
                        aria-label={`Preview ${displayName}`}
                        onClick={() => openDocument(false)}
                      >
                        <PreviewIcon />
                      </ButtonBase>
                      <ButtonBase
                        className={styles.docActionBtn}
                        disableRipple
                        aria-label={`Download ${displayName}`}
                        onClick={() => openDocument(true)}
                      >
                        <DownloadIcon />
                      </ButtonBase>
                      <ButtonBase
                        className={styles.docActionBtn}
                        disableRipple
                        aria-label={`Delete ${displayName}`}
                        disabled={deletingDocumentId === doc.documentId}
                        onClick={() => setConfirmDeleteDocumentId(doc.documentId)}
                      >
                        {deletingDocumentId === doc.documentId ? (
                          <CircularProgress size={14} sx={{ color: '#b0b4b8' }} />
                        ) : (
                          <TrashIcon />
                        )}
                      </ButtonBase>
                    </Box>
                  </Box>
                )
              })
            )}

            {/* Upload document button / area */}
            <Box
              className={styles.uploadRow}
              role="button"
              tabIndex={0}
              aria-label="Upload document"
              onClick={() => setUploadModalOpen(true)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setUploadModalOpen(true) }}
            >
              <UploadIcon />
              <Typography component="span" className={styles.uploadRowText}>
                Upload document
              </Typography>
            </Box>

            <Dialog
              open={confirmDeleteDocumentId !== null}
              onClose={() => setConfirmDeleteDocumentId(null)}
              aria-labelledby="delete-doc-dialog-title"
            >
              <DialogTitle id="delete-doc-dialog-title">Delete Document</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to delete this document? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <ButtonBase
                  onClick={() => setConfirmDeleteDocumentId(null)}
                  disableRipple
                  sx={{ px: 2, py: 1, fontSize: 14, borderRadius: 1, color: '#57606a' }}
                >
                  Cancel
                </ButtonBase>
                <ButtonBase
                  disableRipple
                  sx={{ px: 2, py: 1, fontSize: 14, borderRadius: 1, color: '#d32f2f', fontWeight: 600 }}
                  onClick={() => {
                    const docId = confirmDeleteDocumentId!
                    setConfirmDeleteDocumentId(null)
                    setDeletingDocumentId(docId)
                    recruiterCandidatesApi
                      .deleteDocument(docId)
                      .then(() => {
                        setDocuments((prev) => prev.filter((d) => d.documentId !== docId))
                      })
                      .finally(() => {
                        setDeletingDocumentId(null)
                      })
                  }}
                >
                  Delete
                </ButtonBase>
              </DialogActions>
            </Dialog>

            <UploadDocumentModal
              open={uploadModalOpen}
              onClose={() => setUploadModalOpen(false)}
              onDone={(file) =>
                recruiterCandidatesApi
                  .uploadDocument({
                    file,
                    ownerType: 'CANDIDATE',
                    ownerId: candidateId!,
                  })
                  .then((newDoc) => {
                    setDocuments((prev) => [...prev, newDoc])
                    setUploadModalOpen(false)
                  })
              }
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateDetailScreen
