import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Box, ButtonBase, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { RootState } from '@/store'
import styles from './MandateDetailPage.module.css'

// ── Icons ──────────────────────────────────────────────────────────────

const TrendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <polyline points="3 17 8 12 12 15 17 9 21 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="17 9 21 9 21 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ApplicantsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M2 20c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    <path d="M17 11l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TransformationIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7"/>
    <path d="M7 9h4M7 12h8M7 15h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
)

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="6"  cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path d="M2 6l3 3 5-5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

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

const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="4" stroke="#b0bec5" strokeWidth="1.5"/>
    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="#b0bec5" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5" y1="5" x2="19" y2="19" stroke="#e57373" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// ── Main Component ─────────────────────────────────────────────────────

const MandateDetailPage = () => {
  const navigate = useNavigate()
  const { cardId } = useParams<{ cardId: string }>()
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false)

  // ── Load data from Redux store ──────────────────────────────────────
  const mandate = useSelector((state: RootState) =>
    state.recruiterPipeline.mandates.find(m => m.id === cardId)
  )

  const inboundCandidates = useSelector((state: RootState) =>
    state.recruiterPipeline.candidates.filter(
      c => c.mandateId === cardId && c.currentStage === 'Inbound'
    )
  )

  // ── Navigate to Candidate Profile ──────────────────────────────────
  const handleViewCandidate = (candidateId: string) => {
    const path = ROUTE_PATHS.recruiterCandidate
      .replace(':cardId', cardId ?? '')
      .replace(':candidateId', candidateId)
    navigate(path)
  }

  // ── Fallback if mandate not found ───────────────────────────────────
  if (!mandate) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <Box style={{ padding: '48px 32px', color: '#57606a' }}>
            Mandate not found.{' '}
            <ButtonBase onClick={() => navigate(ROUTE_PATHS.recruiter)} disableRipple style={{ color: '#03478C', textDecoration: 'underline' }}>
              Back to Pipeline
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

        {/* ── Breadcrumb header bar ── */}
        <Box className={styles.breadcrumbBar}>
          <ButtonBase className={styles.backBtn} onClick={() => navigate(ROUTE_PATHS.recruiter)} disableRipple>
            <BackArrowIcon /> Back
          </ButtonBase>
          <Box className={styles.breadcrumbDivider} />
          <ButtonBase className={styles.breadcrumbLink} onClick={() => navigate(ROUTE_PATHS.recruiter)} disableRipple>
            Mandates
          </ButtonBase>
          <Box className={styles.breadcrumbArrow}><ChevronRightIcon /></Box>
          <Typography component="span" className={styles.breadcrumbCurrent}>
            {mandate.title}
          </Typography>
          <Box component="span" className={styles.statusBadgePill}>{mandate.status}</Box>
        </Box>

        <Box className={styles.layout}>
          {/* ── Left column ── */}
          <Box className={styles.leftCol}>

            {/* Post data wrapper */}
            <Box className={styles.postDataWrapper}>
              <Typography component="p" className={styles.postDataTitle}>Post data</Typography>
              <Box className={styles.statsBanner}>
                <Box className={`${styles.statCard} ${styles.statCardViews}`}>
                  <Box>
                    <Typography component="p" className={styles.statValue}>{mandate.views}</Typography>
                    <Typography component="p" className={styles.statLabel}>Views</Typography>
                  </Box>
                  <Box className={styles.statIcon}><TrendIcon /></Box>
                </Box>
                <Box className={`${styles.statCard} ${styles.statCardApplicants}`}>
                  <Box>
                    <Typography component="p" className={styles.statValue}>{mandate.applicants}</Typography>
                    <Typography component="p" className={styles.statLabel}>Applicants</Typography>
                  </Box>
                  <Box className={styles.statIcon}><ApplicantsIcon /></Box>
                </Box>
                <Box className={`${styles.statCard} ${styles.statCardTransformation}`}>
                  <Box>
                    <Typography component="p" className={styles.statValue}>{mandate.transformationApplicants}</Typography>
                    <Typography component="p" className={styles.statLabel}>Transformation applicants</Typography>
                  </Box>
                  <Box className={styles.statIcon}><TransformationIcon /></Box>
                </Box>
              </Box>
            </Box>

            {/* Job Details accordion */}
            <Box className={styles.jobDetailsCard}>
              <Box
                className={styles.jobDetailsHeader}
                onClick={() => setJobDetailsOpen(o => !o)}
                role="button"
                aria-expanded={jobDetailsOpen}
              >
                <Typography component="h2" className={styles.jobDetailsTitle}>
                  Job details
                </Typography>
                <Box className={`${styles.chevronIcon} ${jobDetailsOpen ? styles.chevronIconOpen : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Box>
              </Box>
              {jobDetailsOpen && (
                <Typography component="p" className={styles.jobDetailsBody}>
                  {mandate.jobDetails}
                </Typography>
              )}
            </Box>

            {/* Top Candidates table */}
            <Box className={styles.candidatesCard}>
              <Typography component="p" className={styles.candidatesHeading}>
                Top candidates for this post
              </Typography>

              {inboundCandidates.length === 0 ? (
                <Box className={styles.emptyState}>
                  <EmptyIcon />
                  <Typography component="p" className={styles.emptyStateText}>
                    No candidates in Inbound for this mandate yet.
                  </Typography>
                </Box>
              ) : (
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.checkboxCell}></th>
                      <th>Name</th>
                      <th>Title</th>
                      <th>Match</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboundCandidates.map(c => (
                      <tr key={c.id} className={styles.tableRow}>
                        <td className={styles.checkboxCell}>
                          <Box className={styles.checkboxIcon}><CheckIcon /></Box>
                        </td>
                        <td>
                          <Typography component="span" className={styles.candidateName}>{c.name}</Typography>
                        </td>
                        <td>
                          <Typography component="span" className={styles.candidateTitle}>{c.title}</Typography>
                        </td>
                        <td>
                          <Box className={styles.matchBarTrack}>
                            <Box className={styles.matchBarFill} style={{ width: `${c.matchScore}%` }} />
                          </Box>
                        </td>
                        <td>
                          <Box component="span" className={styles.statusBadge}>{c.currentStage}</Box>
                        </td>
                        <td>
                          <ButtonBase className={styles.viewLink} disableRipple onClick={() => handleViewCandidate(c.id)}>
                            View <ArrowIcon />
                          </ButtonBase>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Box>
          </Box>

          {/* ── Right column ── */}
          <Box className={styles.rightCol}>
            <ButtonBase className={styles.actionBtn} disableRipple>
              <EditIcon /> Edit
            </ButtonBase>
            <ButtonBase className={styles.actionBtn} disableRipple>
              <ShareIcon /> Share
            </ButtonBase>

            <Box className={styles.metaCard}>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Company</Typography>
                <Typography component="p" className={styles.metaLink}>{mandate.company}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Employment type</Typography>
                <Typography component="p" className={styles.metaValue}>{mandate.employmentType}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Experience</Typography>
                <Typography component="p" className={styles.metaValue}>{mandate.experience}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Salary</Typography>
                <Typography component="p" className={styles.metaValue}>{mandate.salary}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Job published</Typography>
                <Typography component="p" className={styles.metaValue}>{mandate.jobPublished}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Job Reference No.</Typography>
                <Typography component="p" className={styles.metaValue}>{mandate.jobReference}</Typography>
              </Box>
            </Box>

            <Box className={styles.postedOnSection}>
              <Typography component="p" className={styles.postedOnLabel}>Posted on</Typography>
              <Box className={styles.postedOnList}>
                {mandate.postedOn.map(site => (
                  <Box key={site.name} className={styles.postedOnItem}>
                    <Box className={styles.postedOnIconBox} style={{ background: site.color }}>
                      {site.label}
                    </Box>
                    {site.name}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MandateDetailPage
