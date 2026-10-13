import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { jobProfileApi, type JobProfile, type TopCandidate } from '@/services/api/recruiterCandidatesApi'
import { mandateApi } from '@/services/api/mandateApi'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { formatPhoneNumberDisplay } from '@/app/phoneNumber'
import styles from './MandateDetailPage.module.css'
import lineChartIcon from '@/assets/recruiter/line-chart-line.svg'
import userLineIcon from '@/assets/recruiter/user-line.svg'
import calendarMonthIcon from '@/assets/recruiter/calendar_month.svg'

// ── Icons ──────────────────────────────────────────────────────────────

const BackArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
)


const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// ── Main Component ─────────────────────────────────────────────────────

const MandateDetailPage = () => {
  const navigate = useNavigate()
  const { jobProfileId, candidateId, visitorId, cardId } = useParams<{
    jobProfileId: string
    candidateId: string
    visitorId: string
    cardId: string
  }>()

  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [topCandidates, setTopCandidates] = useState<TopCandidate[]>([])
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const [candidatesTotal, setCandidatesTotal] = useState(0)
  const [candidatesPage, setCandidatesPage] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [pipelineLoading, setPipelineLoading] = useState(false)

  // Resolve the id — comes as :jobProfileId from candidate flow, :cardId from mandate flow
  const resolvedId = jobProfileId ?? cardId

  useEffect(() => {
    if (!resolvedId) return
    let cancelled = false

    setLoading(true)
    setError(null)

    jobProfileApi
      .getJobProfile(resolvedId)
      .then((data) => {
        if (!cancelled) setJobProfile(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load job profile. Please try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    // Load top candidates filtered by jobProfileId
    setCandidatesLoading(true)
    setCandidatesPage(0)
    jobProfileApi
      .getTopCandidates(resolvedId, 0, 10)
      .then((res) => {
        if (!cancelled) {
          setTopCandidates(res.data)
          setCandidatesTotal(res.total)
        }
      })
      .catch(() => {
        if (!cancelled) setTopCandidates([])
      })
      .finally(() => {
        if (!cancelled) setCandidatesLoading(false)
      })

    return () => { cancelled = true }
  }, [resolvedId])

  const handleLoadMore = () => {
    if (!resolvedId || loadingMore) return
    const nextPage = candidatesPage + 1
    setLoadingMore(true)
    jobProfileApi
      .getTopCandidates(resolvedId, nextPage, 10)
      .then((res) => {
        setTopCandidates(prev => [...prev, ...res.data])
        setCandidatesTotal(res.total)
        setCandidatesPage(nextPage)
      })
      .finally(() => setLoadingMore(false))
  }

  const goBack = () => {
    if (visitorId) {
      navigate(ROUTE_PATHS.recruiterVisitorDetail.replace(':visitorId', visitorId))
    } else if (candidateId) {
      navigate(ROUTE_PATHS.recruiterCandidateDetail.replace(':candidateId', candidateId))
    } else {
      navigate(ROUTE_PATHS.recruiterDashboard)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── Loading ──
  if (loading) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress size={32} />
          </Box>
        </Box>
      </Box>
    )
  }

  // ── Error / not found ──
  if (error || !jobProfile) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <Box className={styles.breadcrumbBar}>
            <ButtonBase className={styles.backBtn} onClick={goBack} disableRipple>
              <BackArrowIcon /> Back
            </ButtonBase>
          </Box>
          <Box style={{ padding: '48px 32px', color: '#57606a' }}>
            {error ?? 'Job profile not found.'}{' '}
            <ButtonBase onClick={goBack} disableRipple style={{ color: '#03478C', textDecoration: 'underline' }}>
              Go back
            </ButtonBase>
          </Box>
        </Box>
      </Box>
    )
  }

  // ── Salary display helper ──
  const salaryDisplay = (() => {
    if (jobProfile.minSalary != null && jobProfile.maxSalary != null) {
      return `R${jobProfile.minSalary.toLocaleString()} – R${jobProfile.maxSalary.toLocaleString()}`
    }
    if (jobProfile.minSalary != null) return `From R${jobProfile.minSalary.toLocaleString()}`
    if (jobProfile.maxSalary != null) return `Up to R${jobProfile.maxSalary.toLocaleString()}`
    return 'Negotiable'
  })()

  // ── Format employment type ──
  const employmentTypeDisplay = jobProfile.employmentType
    ? jobProfile.employmentType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : '—'

  return (
    <Box className={styles.shell}>
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>

        {/* ── Breadcrumb header bar ── */}
        <Box className={styles.breadcrumbBar}>
          <ButtonBase className={styles.backBtn} onClick={goBack} disableRipple>
            <BackArrowIcon /> Back
          </ButtonBase>
          <Box className={styles.breadcrumbDivider} />
          <ButtonBase className={styles.breadcrumbLink} onClick={goBack} disableRipple>
            {visitorId || candidateId ? 'Candidates' : 'Job Posts'}
          </ButtonBase>
          <Box className={styles.breadcrumbArrow}><ChevronRightIcon /></Box>
          <Typography component="span" className={styles.breadcrumbCurrent}>
            {jobProfile.title}
          </Typography>
          <Box component="span" className={styles.statusBadgePill}>
            {jobProfile.status.charAt(0).toUpperCase() + jobProfile.status.slice(1).toLowerCase()}
          </Box>
          <ButtonBase className={styles.copyLinkBtn} onClick={handleCopyLink} disableRipple>
            <CopyIcon /> {copied ? 'Copied!' : 'Copy Job Post Link'}
          </ButtonBase>
        </Box>

        <Box className={styles.layout}>
          {/* ── Left column ── */}
          <Box className={styles.leftCol}>

            {/* ── Post Data ── */}
            <Box className={styles.postDataWrapper}>
              <Typography component="p" className={styles.postDataTitle}>Post Data</Typography>
              <Box className={styles.statsBanner}>
                <Box className={`${styles.statCard} ${styles.statCardViews}`}>
                  <Box>
                    <Typography component="p" className={styles.statValue}>{jobProfile.viewCount}</Typography>
                    <Typography component="p" className={styles.statLabel}>Views</Typography>
                  </Box>
                  <Box className={styles.statIcon}><img src={lineChartIcon} width={22} height={22} alt="" aria-hidden="true" /></Box>
                </Box>
                <Box className={`${styles.statCard} ${styles.statCardApplicants}`}>
                  <Box>
                    <Typography component="p" className={styles.statValue}>{jobProfile.applicantCount}</Typography>
                    <Typography component="p" className={styles.statLabel}>Applicants</Typography>
                  </Box>
                  <Box className={styles.statIcon}><img src={userLineIcon} width={22} height={22} alt="" aria-hidden="true" /></Box>
                </Box>
                <Box className={`${styles.statCard} ${styles.statCardTransformation}`}>
                  <Box>
                    <Typography component="p" className={styles.statValue}>
                      {jobProfile.daysLeftToFill ?? '—'}
                    </Typography>
                    <Typography component="p" className={styles.statLabel}>Days left to fill the role</Typography>
                  </Box>
                  <Box className={styles.statIcon}><img src={calendarMonthIcon} width={22} height={22} alt="" aria-hidden="true" /></Box>
                </Box>
              </Box>
            </Box>

            {/* ── Contact Person row ── */}
            <Box className={styles.contactCard}>
              <table className={styles.contactTable}>
                <thead>
                  <tr>
                    <th>Contact Person</th>
                    <th>Contact Email</th>
                    <th>Contact Phone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{jobProfile.contactName || '—'}</td>
                    <td>
                      {jobProfile.contactEmail ? (
                        <a className={styles.contactEmailLink} href={`mailto:${jobProfile.contactEmail}`}>
                          {jobProfile.contactEmail}
                        </a>
                      ) : '—'}
                    </td>
                    <td>{formatPhoneNumberDisplay(jobProfile.contactPhone) || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </Box>

            {/* ── Job Details accordion ── */}
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
                  <ChevronDownIcon />
                </Box>
              </Box>
              {jobDetailsOpen && (
                <Box>
                  {/* Job Description */}
                  <Typography component="h3" className={styles.jobDetailsSectionTitle}>
                    Job Description
                  </Typography>
                  <Typography component="p" className={styles.jobDetailsBody}>
                    {jobProfile.description || '—'}
                  </Typography>

                  {/* Requirements */}
                  {jobProfile.requirements.length > 0 && (
                    <>
                      <Typography component="h3" className={styles.jobDetailsSectionTitle}>
                        Requirements
                      </Typography>
                      <Box component="ul" className={styles.jobDetailsList}>
                        {jobProfile.requirements.map((req, i) => (
                          <Box key={i} component="li" className={styles.jobDetailsListItem}>
                            {req}
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Responsibilities */}
                  {jobProfile.responsibilities.length > 0 && (
                    <>
                      <Typography component="h3" className={styles.jobDetailsSectionTitle}>
                        Responsibilities
                      </Typography>
                      <Box component="ul" className={styles.jobDetailsList}>
                        {jobProfile.responsibilities.map((resp, i) => (
                          <Box key={i} component="li" className={styles.jobDetailsListItem}>
                            {resp}
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Skills */}
                  {jobProfile.skills.length > 0 && (
                    <>
                      <Typography component="h3" className={styles.jobDetailsSectionTitle}>
                        Skills
                      </Typography>
                      <Box className={styles.jobDetailsChips}>
                        {jobProfile.skills.map((skill, i) => (
                          <Box
                            key={skill}
                            component="span"
                            className={`${styles.jobDetailsChip} ${styles[`jobDetailsChipColor${i % 6}` as keyof typeof styles]}`}
                          >
                            {skill}
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  {/* Industries */}
                  {jobProfile.industryName && (
                    <>
                      <Typography component="h3" className={styles.jobDetailsSectionTitle}>
                        Industries
                      </Typography>
                      <Box className={styles.jobDetailsChips}>
                        <Box
                          component="span"
                          className={`${styles.jobDetailsChip} ${styles.jobDetailsChipOutlined}`}
                        >
                          {jobProfile.industryName}
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* ── Top Candidates For This Post ── */}
            <Box className={styles.candidatesCard}>
              <Typography component="p" className={styles.topCandidatesHeading}>
                Top Applicants For This Post
              </Typography>
              {candidatesLoading ? (
                <Box style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  <Box className={styles.tableScrollContainer}>
                    <table className={styles.table}>
                      <thead className={styles.tableHead}>
                        <tr>
                          <th>Name</th>
                          <th>Title</th>
                          <th>Match</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCandidates.length === 0 ? (
                          <tr>
                            <td colSpan={5}>
                              <Box className={styles.emptyState}>
                                <Typography component="p" className={styles.emptyStateText}>
                                  No candidates found for this post.
                                </Typography>
                              </Box>
                            </td>
                          </tr>
                        ) : (
                          topCandidates.map((c) => (
                            <tr key={c.candidateId} className={styles.tableRow}>
                              <td>
                                <Typography component="span" className={styles.candidateName}>
                                  {c.fullName}
                                </Typography>
                              </td>
                              <td>
                                <Typography component="span" className={styles.candidateTitle}>
                                  {c.title || '—'}
                                </Typography>
                              </td>
                              <td>
                                <Box className={styles.matchBarTrack}>
                                  <Box
                                    className={styles.matchBarFill}
                                    style={{ width: `${Math.min(c.matchPercentage ?? 0, 100)}%` }}
                                  />
                                </Box>
                              </td>
                              <td>
                                <Box component="span" className={styles.statusBadge}>
                                  {c.status
                                    ? c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()
                                    : '—'}
                                </Box>
                              </td>
                              <td>
                                <ButtonBase
                                  className={styles.viewLink}
                                  disableRipple
                                  onClick={() =>
                                    c.applicantType === 'VISITOR'
                                      ? navigate(
                                          ROUTE_PATHS.recruiterVisitorDetail.replace(':visitorId', c.candidateId)
                                        )
                                      : navigate(
                                          ROUTE_PATHS.recruiterCandidateDetail.replace(':candidateId', c.candidateId)
                                        )
                                  }
                                >
                                  View <ArrowRightIcon />
                                </ButtonBase>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Box>
                  {topCandidates.length < candidatesTotal && (
                    <Box className={styles.loadMoreRow}>
                      <ButtonBase
                        className={styles.loadMoreBtn}
                        disableRipple
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore ? <CircularProgress size={12} sx={{ color: '#03478C', mr: '6px' }} /> : null}
                        Load more
                      </ButtonBase>
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* ── View Applicant Pipeline button ── */}
            <ButtonBase
              className={styles.pipelineBtn}
              disableRipple
              disabled={pipelineLoading}
              onClick={() => {
                if (!resolvedId) return
                setPipelineLoading(true)
                mandateApi
                  .listPipelines({ jobProfileId: resolvedId })
                  .finally(() => setPipelineLoading(false))
                navigate(
                  ROUTE_PATHS.recruiterCandidatePipeline.replace(':cardId', resolvedId)
                )
              }}
            >
              {pipelineLoading ? 'Loading…' : 'View Applicant Pipeline'}
            </ButtonBase>

          </Box>

          {/* ── Right column ── */}
          <Box className={styles.rightCol}>

            {/* Client Rate card */}
            <Box className={styles.clientRateCard}>
              <Typography component="p" className={styles.clientRateLabel}>Client Rate</Typography>
              <Box className={styles.clientRateValue}>
                <Typography component="p" className={styles.clientRateNumber}>
                  {jobProfile.clientRate != null ? `${jobProfile.clientRate}%` : '—'}
                </Typography>
              </Box>
            </Box>

            {/* Meta card */}
            <Box className={styles.metaCard}>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Company</Typography>
                <Typography component="p" className={styles.metaLink}>{jobProfile.companyName || '—'}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Employment Type</Typography>
                <Typography component="p" className={styles.metaValue}>{employmentTypeDisplay}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Experience</Typography>
                <Typography component="p" className={styles.metaValue}>{jobProfile.experienceLevel || '—'}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Salary</Typography>
                <Typography component="p" className={styles.metaValue}>{salaryDisplay}</Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Job Published</Typography>
                <Typography component="p" className={styles.metaValue}>
                  {jobProfile.publishedAt
                    ? new Date(jobProfile.publishedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </Typography>
              </Box>
              <Box className={styles.metaItem}>
                <Typography component="p" className={styles.metaLabel}>Job Reference No.</Typography>
                <Typography component="p" className={styles.metaValue}>{jobProfile.jobReference || '—'}</Typography>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MandateDetailPage
