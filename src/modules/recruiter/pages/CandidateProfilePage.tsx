import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Box, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import UploadDocumentModal from '@/modules/recruiter/components/UploadDocumentModal'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { pushNotification } from '@/store/slices/notificationSlice'
import { addDocument } from '@/store/slices/recruiterPipelineSlice'
import type { RootState } from '@/store'
import type { PipelineStage } from '@/modules/recruiter/types'
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

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const DocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#57606a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const PreviewIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true">
    <path d="M16.031 14.6168L20.3137 18.8995L18.8995 20.3137L14.6168 16.031C13.0769 17.263 11.124 18 9 18C4.032 18 0 13.968 0 9C0 4.032 4.032 0 9 0C13.968 0 18 4.032 18 9C18 11.124 17.263 13.0769 16.031 14.6168ZM14.0247 13.8748C15.2475 12.6146 16 10.8956 16 9C16 5.1325 12.8675 2 9 2C5.1325 2 2 5.1325 2 9C2 12.8675 5.1325 16 9 16C10.8956 16 12.6146 15.2475 13.8748 14.0247L14.0247 13.8748ZM10.1779 5.17624C9.4834 5.48982 9 6.18846 9 7C9 8.1046 9.8954 9 11 9C11.8115 9 12.5102 8.5166 12.8238 7.82212C12.9383 8.1945 13 8.59 13 9C13 11.2091 11.2091 13 9 13C6.79086 13 5 11.2091 5 9C5 6.79086 6.79086 5 9 5C9.41 5 9.8055 5.06167 10.1779 5.17624Z" fill="#B0B4B8"/>
  </svg>
)

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const AiSparkleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M9.55385 16.7751C9.21645 17.5477 8.14721 17.5477 7.80985 16.7751L6.9322 14.7649C6.15116 12.9761 4.74534 11.5521 2.99175 10.7737L0.576033 9.70139C-0.192011 9.36049 -0.19201 8.24317 0.576033 7.90225L2.9163 6.86343C4.71498 6.06501 6.14602 4.5883 6.91372 2.73841L7.80275 0.596223C8.13264 -0.19874 9.23105 -0.198742 9.56095 0.596223L10.45 2.73843C11.2177 4.5883 12.6487 6.06501 14.4474 6.86343L16.7877 7.90225C17.5557 8.24317 17.5557 9.36049 16.7877 9.70139L14.372 10.7737C12.6184 11.5521 11.2126 12.9761 10.4315 14.7649L9.55385 16.7751ZM3.47901 8.80183C5.76485 9.81649 7.62347 11.4843 8.68183 13.7791C9.74025 11.4843 11.5989 9.81649 13.8847 8.80183C11.5716 7.77506 9.70705 6.02596 8.68184 3.69037C7.65664 6.02597 5.79212 7.77506 3.47901 8.80183ZM18.3409 21.6694L18.5877 21.1037C19.0277 20.0951 19.8202 19.292 20.809 18.8527L21.5694 18.5148C21.9807 18.3321 21.9807 17.7344 21.5694 17.5517L20.8516 17.2327C19.8373 16.7821 19.0306 15.9493 18.5981 14.9064L18.3447 14.2951C18.168 13.8691 17.579 13.8691 17.4023 14.2951L17.1489 14.9064C16.7165 15.9493 15.9098 16.7821 14.8955 17.2327L14.1776 17.5517C13.7664 17.7344 13.7664 18.3321 14.1776 18.5148L14.938 18.8527C15.9269 19.292 16.7193 20.0951 17.1593 21.1037L17.4062 21.6694C17.5868 22.0835 18.1602 22.0835 18.3409 21.6694ZM17.314 18.0264L17.8765 17.4678L18.4273 18.0264L17.8765 18.5693L17.314 18.0264Z" fill="#03478C"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="#03478C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Helpers ────────────────────────────────────────────────────────────

// Stage badge colors
const STAGE_COLORS: Record<PipelineStage, string> = {
  Inbound:    '#3aafb9',
  Screening:  '#2196a8',
  Assessment: '#f59e0b',
  Interview:  '#7c5cd8',
  Shortlisted:  '#2196a8',
  Offer:      '#4BAF73',
  Placed:     '#2f9a5f',
  Closed:     '#d96b6b',
}

// Profile section icons — match Figma exactly
const SECTION_ICONS: Record<string, React.ReactNode> = {
  // Graduation cap
  Education: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z" stroke="#03478C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" stroke="#03478C" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  // Briefcase
  'Desired job': (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="3" stroke="#03478C" strokeWidth="1.8"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#03478C" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="2" y1="14" x2="22" y2="14" stroke="#03478C" strokeWidth="1.8"/>
    </svg>
  ),
  // Document with lines
  Experience: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2" stroke="#03478C" strokeWidth="1.8"/>
      <path d="M8 7h8M8 11h8M8 15h5" stroke="#03478C" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
}

// ── Collapsible Section ────────────────────────────────────────────────

interface CollapsibleSectionProps {
  label: string
  children: React.ReactNode
}

const CollapsibleSection = ({ label, children }: CollapsibleSectionProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Box className={styles.profileSection}>
      <ButtonBase className={styles.profileSectionHeader} onClick={() => setOpen(o => !o)} disableRipple>
        <Box className={styles.profileSectionIconWrap}>
          {SECTION_ICONS[label] ?? <AiSparkleIcon />}
        </Box>
        <Typography component="span" className={styles.profileSectionLabel}>{label}</Typography>
        <Box className={styles.profileSectionToggle}>
          {open ? <MinusIcon /> : <PlusIcon />}
        </Box>
      </ButtonBase>
      {open && <Box className={styles.profileSectionBody}>{children}</Box>}
    </Box>
  )
}

// ── Main Component ─────────────────────────────────────────────────────

const CandidateProfilePage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cardId, candidateId } = useParams<{ cardId: string; candidateId: string }>()

  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const candidate = useSelector((state: RootState) =>
    state.recruiterPipeline.candidates.find(c => c.id === candidateId)
  )
  const mandate = useSelector((state: RootState) =>
    state.recruiterPipeline.mandates.find(m => m.id === cardId)
  )

  const backToMandate = () => {
    navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', cardId ?? ''))
  }

  const handleUploadDone = (file: File, docName: string) => {
    dispatch(addDocument({
      candidateId: candidateId ?? '',
      document: {
        name: docName,
        type: 'Other',
        url: URL.createObjectURL(file),
        uploadedBy: 'recruiter',
        uploadedAt: new Date().toISOString(),
      },
    }))
    setUploadModalOpen(false)
    dispatch(pushNotification({
      level: 'success',
      title: 'Document uploaded',
      message: `"${docName}" was uploaded successfully.`,
    }))
  }


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

  const initials = candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

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
          <Box component="span" className={styles.stageBadge} style={{ background: STAGE_COLORS[candidate.currentStage] }}>
            {candidate.currentStage}
          </Box>
        </Box>

        {/* ── Hero header card ── */}
        <Box className={styles.heroCard}>
          {/* Avatar — blank circle per requirements */}
          <Box className={styles.avatarCircle} aria-label="Profile photo placeholder">
            <Typography component="span" className={styles.avatarInitials}>{initials}</Typography>
          </Box>

          {/* Left info column */}
          <Box className={styles.heroInfoCol}>
            <Box className={styles.heroInfoRow}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Full name</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.name}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Job title</Typography>
                <Typography component="p" className={styles.heroInfoValue}>{candidate.title}</Typography>
              </Box>
            </Box>
            <Box className={styles.heroInfoRow}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Email address</Typography>
                <Typography component="p" className={`${styles.heroInfoValue} ${styles.heroInfoLink}`}>{candidate.email}</Typography>
              </Box>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Skills</Typography>
                <Box className={styles.skillsRow}>
                  {candidate.skills.map(skill => (
                    <Box key={skill} component="span" className={styles.skillChip}>{skill}</Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <Box className={styles.heroInfoRow}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Phone number</Typography>
                <Typography component="p" className={`${styles.heroInfoValue} ${styles.heroInfoLink}`}>{candidate.phone}</Typography>
              </Box>
            </Box>
            <Box className={styles.heroInfoRow}>
              <Box className={styles.heroInfoBlock}>
                <Typography component="p" className={styles.heroInfoLabel}>Residential location</Typography>
                <Typography component="p" className={`${styles.heroInfoValue} ${styles.heroInfoLink}`}>{candidate.location}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── Main two-column layout ── */}
        <Box className={styles.layout}>

          {/* ── Left column ── */}
          <Box className={styles.leftCol}>

            {/* AI Next Actions */}
            <Box className={styles.aiActionsSection}>
              <Box className={styles.aiActionsHeading}>
                <AiSparkleIcon />
                <Typography component="span" className={styles.aiLabel}>AI</Typography>
                <Typography component="span" className={styles.aiTitle}>Next Actions for this Candidate</Typography>
              </Box>
              <Box className={styles.aiActionBtns}>
                <ButtonBase className={styles.aiBtn} disableRipple onClick={() => dispatch(pushNotification({ level: 'info', title: 'Matched Jobs', message: 'Fetching latest matched jobs for this candidate...' }))}>
                  Send Latest Matched Jobs
                </ButtonBase>
                <ButtonBase className={styles.aiBtn} disableRipple onClick={() => dispatch(pushNotification({ level: 'info', title: 'Contact Details', message: 'Opening contact details verification...' }))}>
                  Double-check Contact Details
                </ButtonBase>
                <ButtonBase className={styles.aiBtn} disableRipple onClick={() => dispatch(pushNotification({ level: 'info', title: 'Outreach Email', message: 'Opening email composer...' }))}>
                  Send Outreach Email
                </ButtonBase>
              </Box>
            </Box>

            {/* Profile sections */}
            <Box className={styles.profileSectionsWrapper}>
              <Typography component="h2" className={styles.profileSectionsTitle}>Profile</Typography>
              <Box className={styles.profileTitleDivider} />
              <Box className={styles.profileSectionsList}>
                <CollapsibleSection label="Education">
                  {candidate.educationList.map((e, i) => (
                    <Box key={i} className={styles.profileEntry}>
                      <Typography component="p" className={styles.profileEntryTitle}>{e.qualification} {e.field}</Typography>
                      <Typography component="p" className={styles.profileEntryMeta}>{e.institution} · {e.year}</Typography>
                    </Box>
                  ))}
                </CollapsibleSection>

                <CollapsibleSection label="Desired job">
                  <Typography component="p" className={styles.profileEntryBody}>{candidate.desiredJob}</Typography>
                </CollapsibleSection>

                <CollapsibleSection label="Experience">
                  {candidate.experienceList.map((e, i) => (
                    <Box key={i} className={styles.profileEntry}>
                      <Typography component="p" className={styles.profileEntryTitle}>{e.role} · {e.company}</Typography>
                      <Typography component="p" className={styles.profileEntryMeta}>{e.period}</Typography>
                      <Typography component="p" className={styles.profileEntryBody}>{e.description}</Typography>
                    </Box>
                  ))}
                </CollapsibleSection>

              </Box>
            </Box>
          </Box>

          {/* ── Right column ── */}
          <Box className={styles.rightCol}>

            {/* Applications */}
            <Box className={styles.rightSection}>
              <Typography component="h2" className={styles.rightSectionTitle}>Applications</Typography>
              <Box className={styles.applicationsList}>
                {candidate.applications.map(app => (
                  <Box key={app.id} className={styles.applicationRow}>
                    <Typography component="span" className={styles.appJobTitle}>{app.jobTitle}</Typography>
                    <Typography component="span" className={styles.appCompany}>{app.company}</Typography>
                    <Box component="span" className={styles.appStageBadge} style={{ background: app.stageColor }}>
                      {app.currentStage}
                    </Box>
                    <ButtonBase
                      className={styles.appViewBtn}
                      disableRipple
                      onClick={() => navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', app.mandateId))}
                    >
                      View <ArrowRightIcon />
                    </ButtonBase>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Documents */}
            <Box className={styles.rightSection}>
              <Box className={styles.documentsHeader}>
                <Typography component="h2" className={styles.rightSectionTitle}>Documents</Typography>
                <ButtonBase className={styles.uploadBtn} disableRipple onClick={() => setUploadModalOpen(true)}>
                  <UploadIcon /> Upload
                </ButtonBase>
              </Box>
              <Box className={styles.documentsList}>
                {candidate.documents.map(doc => (
                  <Box key={doc.id} className={styles.documentRow}>
                    <DocIcon />
                    <Typography component="span" className={styles.docName}>{doc.name}</Typography>
                    <Box className={styles.docActions}>
                      <ButtonBase className={styles.docActionBtn} disableRipple aria-label="Preview">
                        <PreviewIcon />
                      </ButtonBase>
                      <ButtonBase className={styles.docActionBtn} disableRipple aria-label="Download">
                        <DownloadIcon />
                      </ButtonBase>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Upload Document Modal */}
      {uploadModalOpen && (
        <UploadDocumentModal
          onClose={() => setUploadModalOpen(false)}
          onDone={handleUploadDone}
        />
      )}
    </Box>
  )
}

export default CandidateProfilePage
