import { Box, ButtonBase, CircularProgress, Link, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import type { CandidateApplication } from '@/modules/candidate/types'
import {
  useCandidateApplicationsQuery,
  useCandidateProfileQuery,
} from '@/modules/candidate/hooks/useCandidateQueries'
import bardLineIcon from '@/assets/candidate-dashboard/bard-line.svg'
import expandCirclePlusIcon from '@/assets/candidate-dashboard/expand-circle-plus.svg'
import bookmarkLineIcon from '@/assets/candidate-dashboard/bookmark-line.svg'
import seoLineIcon from '@/assets/candidate-dashboard/seo-line.svg'
import settings4LineIcon from '@/assets/candidate-dashboard/settings-4-line.svg'
import fileList2LineIcon from '@/assets/candidate-dashboard/file-list-2-line.svg'
import progress5LineIcon from '@/assets/candidate-dashboard/progress-5-line.svg'
import verifiedBadgeLineIcon from '@/assets/candidate-dashboard/verified-badge-line.svg'
import { ROUTE_PATHS } from '@/routes/routePaths'
import {
  selectCandidateApplicationIds,
  selectCandidateApplications,
  selectCandidateProfile,
} from '@/store/selectors/candidateSelectors'
import styles from './CandidateDashboardPage.module.css'

// ── Types ─────────────────────────────────────────────────────────────

type PipelineStage = 'applied' | 'screening' | 'assessment' | 'interview' | 'shortlisted' | 'offer'

export type ApplicationStatusKey =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'rejected'
  | 'offer_extended'
  | 'shortlisted'

export type ApplicationStatusConfig = {
  label: string
  color: string
}

type Application = {
  id: string
  title: string
  status: ApplicationStatusKey
  pipelineStage: PipelineStage
  message: string
  messageLink?: string
  messageLinkText?: string
}

// ── Constants ─────────────────────────────────────────────────────────

const PIPELINE_STAGES: PipelineStage[] = [
  'applied', 'screening', 'assessment', 'interview', 'shortlisted', 'offer',
]

const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  applied: 'Applied',
  screening: 'Screening',
  assessment: 'Assessment',
  interview: 'Interview',
  shortlisted: 'Shortlisted',
  offer: 'Offer',
}

export const APPLICATION_STATUS_CONFIG: Record<ApplicationStatusKey, ApplicationStatusConfig> = {
  applied:        { label: 'Applied',        color: '#72c4e0' },
  screening:      { label: 'Screening',      color: '#4db8c8' },
  interview:      { label: 'Interview',      color: '#7c5cd8' },
  rejected:       { label: 'Rejected',       color: '#e07070' },
  offer_extended: { label: 'Offer extended', color: '#5bbf8a' },
  shortlisted:    { label: 'Shortlisted',    color: '#e085c2' },
}

const STAGE_TO_STATUS: Record<string, ApplicationStatusKey> = {
  shortlisted:    'shortlisted',
  interview:      'interview',
  screening:      'screening',
  assessment:     'screening',
  offer:          'offer_extended',
  offer_extended: 'offer_extended',
  rejected:       'rejected',
  unsuccessful:   'rejected',
}

const PIPELINE_STAGE_SET = new Set<string>(PIPELINE_STAGES)

// ── Helpers ───────────────────────────────────────────────────────────

const mapStageToStatusKey = (stage: string): ApplicationStatusKey =>
  STAGE_TO_STATUS[stage.toLowerCase()] ?? 'applied'

const mapStageToPipelineStage = (stage: string): PipelineStage => {
  const lower = stage.toLowerCase()
  return PIPELINE_STAGE_SET.has(lower) ? (lower as PipelineStage) : 'applied'
}

const transformApplicationToDisplay = (app: CandidateApplication): Application => {
  const status = mapStageToStatusKey(app.currentStage)
  return {
    id: app.applicationId,
    title: `${app.jobTitle} at ${app.company}`,
    status,
    pipelineStage: mapStageToPipelineStage(app.currentStage),
    message: app.coverLetter || `Applied on ${new Date(app.appliedDate).toLocaleDateString()}`,
  }
}

// ── Sub-components ────────────────────────────────────────────────────

type StatCardProps = {
  value: number
  icon: string
  label: string
  description: string
  colorClass: string
}

const StatCard = ({ value, icon, label, description, colorClass }: StatCardProps) => (
  <Box className={`${styles.statCard} ${colorClass}`}>
    <Box className={styles.statCardTop}>
      <Typography component="p" className={styles.statValue}>{value}</Typography>
      <Box className={styles.statIcon} aria-hidden="true">
        <Box component="img" src={icon} alt="" className={styles.statIconImage} />
      </Box>
    </Box>
    <Typography component="p" className={styles.statLabel}>{label}</Typography>
    <Typography component="p" className={styles.statDesc}>{description}</Typography>
  </Box>
)

type ApplicationEntryProps = {
  app: Application
  isFirst: boolean
  onExpand: () => void
}

const ApplicationEntry = ({ app, isFirst, onExpand }: ApplicationEntryProps) => (
  <Box className={styles.applicationEntry}>
    {!isFirst && <Box className={styles.applicationDivider} />}
    <Box className={styles.applicationHeader}>
      <Box className={styles.applicationTitleRow}>
        <Typography component="h3" className={styles.applicationTitle}>
          {app.title}
        </Typography>
        <ButtonBase
          type="button"
          className={styles.expandButton}
          aria-label={`View details for ${app.title}`}
          onClick={onExpand}
          disableRipple
        >
          <Box component="img" src={expandCirclePlusIcon} alt="" className={styles.expandButtonIcon} aria-hidden="true" />
        </ButtonBase>
      </Box>
      <Box className={styles.statusPill} data-status={app.status}>
        {APPLICATION_STATUS_CONFIG[app.status].label}
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
        <Box className={`${styles.pipelineFill} ${styles[`pipelineFill${PIPELINE_STAGES.indexOf(app.pipelineStage)}`]}`} />
      </Box>
    </Box>

    <Typography component="p" className={styles.applicationMessage}>
      {app.message}
      {app.messageLink && (
        <Link href={app.messageLink} className={styles.applicationMessageLink}>
          {app.messageLinkText}
        </Link>
      )}
    </Typography>
  </Box>
)

// ── Main Component ────────────────────────────────────────────────────

const CandidateDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const candidateId = user?.id
  const profile = useSelector(selectCandidateProfile)
  const applicationIds = useSelector(selectCandidateApplicationIds)
  const storedApplications = useSelector(selectCandidateApplications)
  const { isLoading: profileLoading } = useCandidateProfileQuery(candidateId)
  const { isLoading: applicationsLoading } = useCandidateApplicationsQuery(applicationIds)

  const firstName = profile?.fullName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? 'there'

  const statCards: StatCardProps[] = [
    {
      value: storedApplications.length,
      icon: fileList2LineIcon,
      label: 'Applications',
      description: 'Applications you have submitted through The Skills Mine',
      colorClass: styles.statCardBlue,
    },
    {
      value: storedApplications.filter((a) => a.currentStage.toLowerCase() === 'offer').length,
      icon: verifiedBadgeLineIcon,
      label: 'Successful',
      description: 'Successful applications through The Skills Mine',
      colorClass: styles.statCardGreen,
    },
    {
      value: storedApplications.filter((a) =>
        ['screening', 'assessment', 'interview', 'shortlisted'].includes(a.currentStage.toLowerCase()),
      ).length,
      icon: progress5LineIcon,
      label: 'In Progress',
      description: 'Applications in progress through The Skills Mine',
      colorClass: styles.statCardTealMuted,
    },
  ]

  const handleNavigateJobs = () => navigate(ROUTE_PATHS.jobs)
  const handleBuildCv = () => {
    navigate(ROUTE_PATHS.cvBuilder)
  }
  const handleExpandApplication = () => {
    // TODO: Navigate to application detail when route is available
  }

  const quickActions = [
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
      onClick: handleNavigateJobs,
    },
    {
      id: 'latest',
      icon: seoLineIcon,
      title: 'Latest\nJobs',
      subtitle: 'View all the latest job posts.',
      cardClass: styles.quickCardNavy,
      iconFrameClass: styles.quickCardIconFrameNavy,
      onClick: handleNavigateJobs,
    },
    {
      id: 'recommended',
      icon: bardLineIcon,
      title: 'Recommended\nJobs',
      subtitle: 'View recommended jobs for you.',
      cardClass: styles.quickCardPurple,
      iconFrameClass: styles.quickCardIconFrameNeutral,
      onClick: handleNavigateJobs,
    },
  ]

  if (profileLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    )
  }

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
            {statCards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
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
          {applicationsLoading ? (
            <Box className={styles.applicationsLoadingContainer}>
              <CircularProgress />
            </Box>
          ) : storedApplications.length === 0 ? (
            <Typography component="p" className={styles.emptyApplications}>
              No applications yet. Start applying to jobs!
            </Typography>
          ) : (
            storedApplications.map((apiApp, index) => (
              <ApplicationEntry
                key={apiApp.applicationId}
                app={transformApplicationToDisplay(apiApp)}
                isFirst={index === 0}
                onExpand={handleExpandApplication}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateDashboardPage
