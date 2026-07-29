import { Box, ButtonBase, Link, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import bardLineIcon from '@/assets/candidate-dashboard/bard-line.svg'
import expandCirclePlusIcon from '@/assets/candidate-dashboard/expand-circle-plus.svg'
import bookmarkLineIcon from '@/assets/candidate-dashboard/bookmark-line.svg'
import seoLineIcon from '@/assets/candidate-dashboard/seo-line.svg'
import settings4LineIcon from '@/assets/candidate-dashboard/settings-4-line.svg'
import fileList2LineIcon from '@/assets/candidate-dashboard/file-list-2-line.svg'
import progress5LineIcon from '@/assets/candidate-dashboard/progress-5-line.svg'
import verifiedBadgeLineIcon from '@/assets/candidate-dashboard/verified-badge-line.svg'
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
  icon: string
  title: string
  subtitle: string
  cardClass: string
  iconFrameClass: string
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
      icon: settings4LineIcon,
      title: 'CV\nBuilder',
      subtitle: 'Build a professional CV in minutes.',
      cardClass: styles.quickCardBlue,
      iconFrameClass: styles.quickCardIconFrameBlue,
      onClick: handleBuildCv,
    },
    {
      id: 'saved',
      icon: bookmarkLineIcon,
      title: 'Saved\nJobs',
      subtitle: 'View all your saved job posts.',
      cardClass: styles.quickCardTeal,
      iconFrameClass: styles.quickCardIconFrameTeal,
      onClick: handleSavedJobs,
    },
    {
      id: 'latest',
      icon: seoLineIcon,
      title: 'Latest\nJobs',
      subtitle: 'View all the latest job posts.',
      cardClass: styles.quickCardNavy,
      iconFrameClass: styles.quickCardIconFrameNavy,
      onClick: handleExploreJobs,
    },
    {
      id: 'recommended',
      icon: bardLineIcon,
      title: 'Recommended\nJobs',
      subtitle: 'View recommended jobs for you.',
      cardClass: styles.quickCardPurple,
      iconFrameClass: styles.quickCardIconFrameNeutral,
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
                  <Box component="img" src={fileList2LineIcon} alt="" className={styles.statIconImage} />
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
                  <Box component="img" src={verifiedBadgeLineIcon} alt="" className={styles.statIconImage} />
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
                  <Box component="img" src={progress5LineIcon} alt="" className={styles.statIconImage} />
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
          <ButtonBase
            key={action.id}
            type="button"
            className={`${styles.quickCard} ${action.cardClass}`}
            onClick={action.onClick}
            disableRipple
          >
            <Box className={styles.quickCardHeader}>
              <Box className={action.iconFrameClass} aria-hidden="true">
                <Box component="img" src={action.icon} alt="" className={styles.quickCardIcon} />
              </Box>
              <Typography component="p" className={styles.quickCardTitle}>
                {action.title.split('\n').map((line, i) => (
                  <Box key={`${action.id}-${i}`} component="span" className={styles.quickCardTitleLine}>
                    {line}
                  </Box>
                ))}
              </Typography>
            </Box>
            <Typography component="p" className={styles.quickCardSubtitle}>
              {action.subtitle}
            </Typography>
          </ButtonBase>
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
                  <ButtonBase
                    type="button"
                    className={styles.expandButton}
                    aria-label={`View details for ${app.title}`}
                    onClick={handleExpandApplication}
                    disableRipple
                  >
                    <Box component="img" src={expandCirclePlusIcon} alt="" className={styles.expandButtonIcon} aria-hidden="true" />
                  </ButtonBase>
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
                    <Link href={app.messageLink} className={styles.applicationMessageLink}>
                      {app.messageLinkText}
                    </Link>
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
