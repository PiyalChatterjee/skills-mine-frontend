import { ApplicationStatusLabel, PipelineStageLabel as PipelineLabel } from "@/enums/statuses";
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material'
import { UploadDocumentModal } from './UploadDocumentModal'
import { recruiterCandidatesApi } from '@/services/api/recruiterCandidatesApi'
import type { CandidateDocument } from '@/services/api/recruiterCandidatesApi'
import { visitorApi } from '@/services/api/visitorApi'
import type {
  VisitorDashboardApplicationItem,
  VisitorRecordResponse,
} from '@/services/api/visitorApi'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { formatPhoneNumberDisplay } from '@/app/phoneNumber'
import styles from './CandidateDetailScreen.module.css'

// ── Stage badge colors ─────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  [PipelineLabel.INTERVIEW]:  '#7c5cd8',
  [PipelineLabel.SHORTLIST]:  '#2196a8',
  [PipelineLabel.SCREENING]:   '#2196a8',
  [PipelineLabel.INBOUND]:     '#3aafb9',
  [ApplicationStatusLabel.APPLIED]: '#3aafb9',
  [PipelineLabel.ASSESSMENT]:  '#f59e0b',
  [PipelineLabel.OFFER]:       '#4baf73',
  [PipelineLabel.PLACED]:      '#2f9a5f',
  [PipelineLabel.CLOSED]:      '#d96b6b',
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

export const VisitorDetailScreen = () => {
  const navigate = useNavigate()
  const { visitorId } = useParams<{ visitorId: string }>()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [visitor, setVisitor] = useState<VisitorRecordResponse | null>(null)
  const [applications, setApplications] = useState<VisitorDashboardApplicationItem[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [applicationsTotal, setApplicationsTotal] = useState(0)
  const [applicationsPage, setApplicationsPage] = useState(1)
  const [loadingMoreApplications, setLoadingMoreApplications] = useState(false)
  const [documents, setDocuments] = useState<CandidateDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [confirmDeleteDocumentId, setConfirmDeleteDocumentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visitorId) return
    let cancelled = false

    setLoading(true)
    setError(null)

    visitorApi
      .getById(visitorId)
      .then((data) => {
        if (!cancelled) setVisitor(data)
      })
      .catch((err) => {
        const status = err?.response?.status
        if (!cancelled) {
          if (status === 404) {
            setError('Visitor not found.')
          } else {
            setError('Failed to load visitor profile. Please try again.')
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // Load visitor dashboard applications (GET /visitors/dashboard/:visitorId)
    setApplicationsLoading(true)
    visitorApi
      .getDashboard(visitorId, { page: 1, size: 10 })
      .then((res) => {
        if (!cancelled) {
          setApplications(res.applications ?? [])
          setApplicationsTotal(res.pagination?.totalItems ?? (res.applications ?? []).length)
          setApplicationsPage(res.pagination?.currentPage ?? 1)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApplications([])
          setApplicationsTotal(0)
          setApplicationsPage(1)
        }
      })
      .finally(() => {
        if (!cancelled) setApplicationsLoading(false)
      })

    // Load documents (GET /documents/owner/VISITOR/:visitorId)
    setDocumentsLoading(true)
    recruiterCandidatesApi
      .getDocumentsByOwner('VISITOR', visitorId)
      .then((docs) => {
        if (!cancelled) setDocuments(docs)
      })
      .catch(() => {
        if (!cancelled) setDocuments([])
      })
      .finally(() => {
        if (!cancelled) setDocumentsLoading(false)
      })

    return () => { cancelled = true }
  }, [visitorId])

  const goBack = () => navigate(-1)

  const handleLoadMoreApplications = () => {
    if (!visitorId || loadingMoreApplications) return
    const nextPage = applicationsPage + 1
    setLoadingMoreApplications(true)
    visitorApi
      .getDashboard(visitorId, { page: nextPage, size: 10 })
      .then((res) => {
        setApplications((prev) => [...prev, ...(res.applications ?? [])])
        setApplicationsTotal(res.pagination?.totalItems ?? 0)
        setApplicationsPage(res.pagination?.currentPage ?? nextPage)
      })
      .finally(() => setLoadingMoreApplications(false))
  }

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
  if (error || !visitor) {
    return (
      <Box className={styles.pageRoot}>
        <Box className={styles.breadcrumbBar}>
          <ButtonBase className={styles.backBtn} onClick={goBack} disableRipple>
            <BackArrowIcon /> Back
          </ButtonBase>
        </Box>
        <Box className={styles.centeredState}>
          <Typography color="error">{error ?? 'Visitor not found.'}</Typography>
        </Box>
      </Box>
    )
  }

  const pd = visitor.personal_details
  const fullName = [pd?.first_name, pd?.last_name].filter(Boolean).join(' ') || '—'
  const initials = fullName === '—'
    ? '?'
    : fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  const skills = (visitor.skills ?? []).map((s) => s.skill_name).filter(Boolean) as string[]

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
          {fullName}
        </Typography>
        <Box component="span" className={styles.visitorBadge}>Visitor</Box>
      </Box>

      {/* ── Hero card ── */}
      <Box className={styles.heroCard}>
        {/* Avatar */}
        <Box className={styles.avatarCircle} aria-label="Profile photo placeholder">
          <Typography component="span" className={styles.avatarInitials}>
            {initials}
          </Typography>
        </Box>

        {/* Info grid — 3 columns: left | middle | right  matching the UI */}
        <Box className={styles.heroInfoCol}>
          <Box className={styles.heroInfoGrid3}>

            {/* ── Column 1 ── */}
            <Box className={styles.heroInfoColGroup}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Full Name</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{fullName}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Email Address</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{pd?.email || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Phone Number</Typography>
                <Typography component="p" className={styles.heroInfoValue}>
                  {pd?.phone_number ? formatPhoneNumberDisplay(pd.phone_number) : '—'}
                </Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Residential Location</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{pd?.residential_location || '—'}</Typography>
              </Box>
            </Box>

            {/* ── Column 2 ── */}
            <Box className={styles.heroInfoColGroup}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Gender</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{pd?.gender || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Race</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{pd?.race || '—'}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Disability Status</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{pd?.disability_status || '—'}</Typography>
              </Box>
            </Box>

            {/* ── Column 3 ── */}
            <Box className={styles.heroInfoColGroup}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Skills</Typography>
                {skills.length > 0 ? (
                  <Box className={styles.skillsRow}>
                    {skills.slice(0, 6).map((skill) => (
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
              <>
                {applications.map((app) => (
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
                            ROUTE_PATHS.recruiterVisitorJobDetail
                              .replace(':visitorId', visitorId!)
                              .replace(':jobProfileId', app.jobProfileId)
                          )
                        }
                      }}
                    >
                      View <ArrowRightIcon />
                    </ButtonBase>
                  </Box>
                ))}
                {applications.length < applicationsTotal && (
                  <Box className={styles.loadMoreRow}>
                    <ButtonBase
                      className={styles.loadMoreBtn}
                      disableRipple
                      onClick={handleLoadMoreApplications}
                      disabled={loadingMoreApplications}
                    >
                      {loadingMoreApplications ? (
                        <CircularProgress size={12} sx={{ color: '#03478C', mr: '6px' }} />
                      ) : null}
                      Load more
                    </ButtonBase>
                  </Box>
                )}
              </>
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
                  ROUTE_PATHS.recruiterVisitorCvReview.replace(':visitorId', visitorId!),
                )
              }
            >
              <Typography component="span" className={styles.reviewCvText}>
                {fullName} CV
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
                    ownerType: 'VISITOR',
                    ownerId: visitorId!,
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

export default VisitorDetailScreen
