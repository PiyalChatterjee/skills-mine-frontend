import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { ROUTE_PATHS } from '@/routes/routePaths'
import styles from './CandidateDashboardPage.module.css'

type PipelineStage = 'applied' | 'screening' | 'assessment' | 'interview' | 'shortlisted' | 'offer'

type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'in_review'
  | 'unsuccessful'

type Application = {
  id: string
  title: string
  company: string
  status: ApplicationStatus
  statusLabel: string
  pipelineStage: PipelineStage
  message: string
  messageLink?: string
  messageLinkText?: string
}

const PIPELINE_STAGES: PipelineStage[] = [
  'applied',
  'screening',
  'assessment',
  'interview',
  'shortlisted',
  'offer',
]

const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  assessment: 'Assessment',
  interview: 'Interview',
  shortlisted: 'Shortlisted',
  offer: 'Offer',
}

const PIPELINE_STAGE_INDEX: Record<PipelineStage, number> = {
  applied: 0,
  screening: 1,
  assessment: 2,
  interview: 3,
  shortlisted: 4,
  offer: 5,
}

const PLACEHOLDER_APPLICATIONS: Application[] = [
  {
    id: '1',
    title: 'UX/UI Designer at PwC',
    company: 'PwC',
    status: 'applied',
    statusLabel: 'Applied',
    pipelineStage: 'applied',
    message:
      'Your job application has been successfully submitted and is now with the recruiter.',
  },
  {
    id: '2',
    title: 'Front-end Web Designer at IBM',
    company: 'IBM',
    status: 'shortlisted',
    statusLabel: 'Shortlisted',
    pipelineStage: 'shortlisted',
    message: 'Good news! You have been shortlisted for this position.',
    messageLink: '#',
    messageLinkText: 'Find out more',
  },
  {
    id: '3',
    title: 'UX/UI Designer at Helm',
    company: 'Helm',
    status: 'in_review',
    statusLabel: 'In review',
    pipelineStage: 'screening',
    message: 'The recruiter is currently reviewing your application.',
  },
]

const STATUS_CSS: Record<ApplicationStatus, string> = {
  applied: styles.pillApplied,
  shortlisted: styles.pillShortlisted,
  in_review: styles.pillInReview,
  unsuccessful: styles.pillUnsuccessful,
}

type QuickAction = {
  id: string
  icon: React.ReactNode
  title: string
  subtitle: string
  cardClass: string
  onClick: () => void
}

const CandidateDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  const handleExploreJobs = () => navigate(ROUTE_PATHS.jobs)
  const handleSavedJobs = () => navigate(ROUTE_PATHS.jobs)
  const handleBuildCv = () => {
    // TODO: Navigate to CV builder when route is available
  }
  const handleRecommendedJobs = () => navigate(ROUTE_PATHS.jobs)
  const handleExpandApplication = () => {
    // TODO: Navigate to application detail when route is available
  }

  const quickActions: QuickAction[] = [
    {
      id: 'cv',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M10 10h8M10 14h8M10 18h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M20 8v6l3-3-3-3z" fill="white" />
        </svg>
      ),
      title: 'CV\nBuilder',
      subtitle: 'Build a professional CV in minutes.',
      cardClass: styles.quickCardBlue,
      onClick: handleBuildCv,
    },
    {
      id: 'saved',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M11 9h10a1 1 0 0 1 1 1v13l-6-3-6 3V10a1 1 0 0 1 1-1z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Saved\nJobs',
      subtitle: 'View all your saved job posts.',
      cardClass: styles.quickCardTeal,
      onClick: handleSavedJobs,
    },
    {
      id: 'latest',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <circle cx="15" cy="15" r="5" stroke="white" strokeWidth="1.5" />
          <path d="M22 22l-3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      title: 'Latest\nJobs',
      subtitle: 'View all the latest job posts.',
      cardClass: styles.quickCardNavy,
      onClick: handleExploreJobs,
    },
    {
      id: 'recommended',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <circle cx="16" cy="16" r="14" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          <path d="M16 9l1.5 4h4l-3.3 2.4 1.3 4-3.5-2.5-3.5 2.5 1.3-4L10.5 13h4L16 9z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      ),
      title: 'Recommended\nJobs',
      subtitle: 'View recommended jobs for you.',
      cardClass: styles.quickCardPurple,
      onClick: handleRecommendedJobs,
    },
  ]

  return (
    <Box className={styles.pageRoot}>
      {/* ── Welcome Banner ── */}
      <Box component="section" className={styles.welcomeBanner}>
        <Box className={styles.welcomeBannerInner}>
          <Typography component="h1" className={styles.welcomeGreeting}>
            Hi {firstName}
          </Typography>
          <Typography component="p" className={styles.welcomeSubtitle}>
            Here's an overview of your history with The Skills Mine:
          </Typography>

          <Box className={styles.statsRow}>
            <Box className={`${styles.statCard} ${styles.statCardBlue}`}>
              <Box className={styles.statCardTop}>
                <Typography component="p" className={styles.statValue}>20</Typography>
                <Box className={styles.statIcon} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="4" y="3" width="16" height="20" rx="2" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <path d="M8 9h8M8 13h8M8 17h5" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </Box>
              </Box>
              <Typography component="p" className={styles.statLabel}>Applications</Typography>
              <Typography component="p" className={styles.statDesc}>
                Applications you have submitted through The Skills Mine
              </Typography>
            </Box>

            <Box className={`${styles.statCard} ${styles.statCardGreen}`}>
              <Box className={styles.statCardTop}>
                <Typography component="p" className={styles.statValue}>3</Typography>
                <Box className={styles.statIcon} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <path d="M9 14l3 3 6-6" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Box>
              </Box>
              <Typography component="p" className={styles.statLabel}>Successful</Typography>
              <Typography component="p" className={styles.statDesc}>
                Successful applications through The Skills Mine
              </Typography>
            </Box>

            <Box className={`${styles.statCard} ${styles.statCardTealMuted}`}>
              <Box className={styles.statCardTop}>
                <Typography component="p" className={styles.statValue}>8</Typography>
                <Box className={styles.statIcon} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
                    <path d="M14 14v-4" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="14" cy="16.5" r="1" fill="rgba(255,255,255,0.7)" />
                  </svg>
                </Box>
              </Box>
              <Typography component="p" className={styles.statLabel}>In Progress</Typography>
              <Typography component="p" className={styles.statDesc}>
                Applications in progress through The Skills Mine
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Quick Actions Row ── */}
      <Box component="section" className={styles.quickActionsRow}>
        {quickActions.map((action) => (
          <Box
            key={action.id}
            component="button"
            type="button"
            className={`${styles.quickCard} ${action.cardClass}`}
            onClick={action.onClick}
          >
            <Box className={styles.quickCardIcon}>{action.icon}</Box>
            <Typography component="p" className={styles.quickCardTitle}>
              {action.title.split('\n').map((line, i) => (
                <span key={i}>{line}{i < action.title.split('\n').length - 1 && <br />}</span>
              ))}
            </Typography>
            <Typography component="p" className={styles.quickCardSubtitle}>
              {action.subtitle}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── My Applications ── */}
      <Box component="section" className={styles.applicationsSection}>
        <Typography component="h2" className={styles.sectionTitle}>
          My applications
        </Typography>
        <Box className={styles.applicationsList}>
          {PLACEHOLDER_APPLICATIONS.map((app, index) => (
            <Box key={app.id} className={styles.applicationEntry}>
              {index > 0 && <Box className={styles.applicationDivider} />}
              <Box className={styles.applicationHeader}>
                <Box className={styles.applicationTitleRow}>
                  <Typography component="h3" className={styles.applicationTitle}>
                    {app.title}
                  </Typography>
                  <button
                    type="button"
                    className={styles.expandButton}
                    aria-label={`View details for ${app.title}`}
                    onClick={handleExpandApplication}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="7" stroke="#9bafc4" strokeWidth="1" />
                      <path d="M8 5v6M5 8h6" stroke="#9bafc4" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  </button>
                </Box>
                <Box className={`${styles.statusPill} ${STATUS_CSS[app.status]}`}>
                  {app.statusLabel}
                </Box>
              </Box>

              <Box className={styles.pipelineWrap}>
                <Box className={styles.pipelineLabels}>
                  {PIPELINE_STAGES.map((stage) => (
                    <span key={stage} className={styles.pipelineLabel}>
                      {PIPELINE_STAGE_LABELS[stage]}
                    </span>
                  ))}
                </Box>
                <Box className={styles.pipelineTrack}>
                  <Box
                    className={`${styles.pipelineFill} ${styles[`pipelineFill${PIPELINE_STAGE_INDEX[app.pipelineStage]}`]}`}
                  />
                </Box>
              </Box>

              <Typography component="p" className={styles.applicationMessage}>
                {app.message}
                {app.messageLink && (
                  <>
                    {' '}
                    <a href={app.messageLink} className={styles.applicationMessageLink}>
                      {app.messageLinkText}
                    </a>
                  </>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateDashboardPage
