import { useMemo } from 'react'
import { Box, ButtonBase, CircularProgress, Link, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/auth/AuthContext'
import { useCandidateDashboardQuery } from '@/modules/candidate/hooks/useCandidateQueries'
import type { CandidateApplication } from '@/modules/candidate/types'
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

type PipelineStage =
  | 'inbound'
  | 'screening'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'placed'
  | 'closed'

type ApplicationStatusKey =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'rejected'
  | 'offer_extended'
  | 'shortlisted'
  | 'placed'
  | 'unknown'

const PIPELINE_STAGES: PipelineStage[] = [
  'inbound',
  'screening',
  'shortlisted',
  'interview',
  'offer',
  'placed',
  'closed',
]

const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  inbound: 'Inbound',
  screening: 'Screening',
  shortlisted: 'Shortlisted',
  interview: 'Interview',
  offer: 'Offer',
  placed: 'Placed',
  closed: 'Closed',
}

const APPLICATION_STATUS_CONFIG: Record<ApplicationStatusKey, { label: string; color: string }> = {
  applied: { label: 'Applied', color: '#72c4e0' },
  screening: { label: 'Screening', color: '#4db8c8' },
  interview: { label: 'Interview', color: '#7c5cd8' },
  rejected: { label: 'Rejected', color: '#e07070' },
  offer_extended: { label: 'Offer extended', color: '#5bbf8a' },
  shortlisted: { label: 'Shortlisted', color: '#e085c2' },
  placed: { label: 'Placed', color: '#329d72' },
  unknown: { label: 'Unknown stage', color: '#7a8694' },
}

const STAGE_STATUS_MAP: Record<string, ApplicationStatusKey> = {
  inbound: 'applied',
  applied: 'applied',
  screening: 'screening',
  interview: 'interview',
  offer: 'offer_extended',
  offer_extended: 'offer_extended',
  shortlisted: 'shortlisted',
  placed: 'placed',
  closed: 'rejected',
  rejected: 'rejected',
}

const STAGE_PIPELINE_MAP: Record<string, PipelineStage> = {
  inbound: 'inbound',
  applied: 'inbound',
  screening: 'screening',
  shortlisted: 'shortlisted',
  interview: 'interview',
  offer: 'offer',
  offer_extended: 'offer',
  placed: 'placed',
  closed: 'closed',
  rejected: 'closed',
}

const unknownStages = new Set<string>()

const reportUnknownStage = (stage: string) => {
  const normalized = stage.trim().toLowerCase()
  if (!unknownStages.has(normalized)) {
    unknownStages.add(normalized)
    console.warn('[CandidateDashboardPage] Unknown application stage received from API', {
      stage,
      normalized,
    })
  }
}

const mapStageToStatusKey = (stage: string): ApplicationStatusKey => {
  const normalized = stage.trim().toLowerCase()
  const mapped = STAGE_STATUS_MAP[normalized]
  if (mapped) {
    return mapped
  }

  reportUnknownStage(stage)
  return 'unknown'
}

const mapStageToPipelineStage = (stage: string): PipelineStage | null => {
  const normalized = stage.trim().toLowerCase()
  const mapped = STAGE_PIPELINE_MAP[normalized]
  if (mapped) {
    return mapped
  }

  reportUnknownStage(stage)
  return null
}

const getPipelineFillClassName = (pipelineStage: PipelineStage | null): string => {
  if (!pipelineStage) {
    return styles.pipelineFill0
  }

  const stageIndex = PIPELINE_STAGES.indexOf(pipelineStage)
  const clampedIndex = Math.min(Math.max(stageIndex, 0), 6)
  return styles[`pipelineFill${clampedIndex}`] ?? styles.pipelineFill0
}

type DisplayApplication = {
  id: string
  title: string
  status: ApplicationStatusKey
  pipelineStage: PipelineStage | null
  message: string
}

const transformApplicationToDisplay = (app: CandidateApplication): DisplayApplication => ({
  id: app.applicationId,
  title: `${app.jobTitle} at ${app.company}`,
  status: mapStageToStatusKey(app.currentStage),
  pipelineStage: mapStageToPipelineStage(app.currentStage),
  message: `Applied on ${new Date(app.appliedDate).toLocaleDateString()}`,
})

const CandidateDashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: dashboard, isLoading } = useCandidateDashboardQuery(Boolean(user))

  const statCards = useMemo(() => {
    const summary = dashboard?.summary
    return [
      {
        value: summary?.totalApplications ?? 0,
        icon: fileList2LineIcon,
        label: 'Applications',
        description: 'Applications you have submitted through The Skills Mine',
        colorClass: styles.statCardBlue,
      },
      {
        value: dashboard?.applications.filter((a) => a.currentStage.toLowerCase() === 'placed').length ?? 0,
        icon: verifiedBadgeLineIcon,
        label: 'Successful',
        description: 'Successful applications through The Skills Mine',
        colorClass: styles.statCardGreen,
      },
      {
        value: summary?.activeApplications ?? 0,
        icon: progress5LineIcon,
        label: 'In Progress',
        description: 'Applications in progress through The Skills Mine',
        colorClass: styles.statCardTealMuted,
      },
    ]
  }, [dashboard])

  const firstName = user?.firstName ?? 'there'
  const applications = dashboard?.applications ?? []
  const quickLinks = dashboard?.quickLinks ?? []

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box className={styles.pageRoot}>
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
              <Box key={card.label} className={`${styles.statCard} ${card.colorClass}`}>
                <Box className={styles.statCardTop}>
                  <Typography component="p" className={styles.statValue}>{card.value}</Typography>
                  <Box className={styles.statIcon} aria-hidden="true">
                    <Box component="img" src={card.icon} alt="" className={styles.statIconImage} />
                  </Box>
                </Box>
                <Typography component="p" className={styles.statLabel}>{card.label}</Typography>
                <Typography component="p" className={styles.statDesc}>{card.description}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box component="section" className={styles.quickActionsRow}>
        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardBlue}`}
          onClick={() => navigate(ROUTE_PATHS.cvBuilder)}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box className={styles.quickCardIconFrameBlue} aria-hidden="true">
              <Box component="img" src={settings4LineIcon} alt="" className={styles.quickCardIcon} />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>CV Builder</Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            Build a professional CV in minutes.
          </Typography>
        </ButtonBase>

        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardTeal}`}
          onClick={() => navigate(ROUTE_PATHS.jobs)}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box className={styles.quickCardIconFrameTeal} aria-hidden="true">
              <Box component="img" src={bookmarkLineIcon} alt="" className={styles.quickCardIcon} />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>Saved Jobs</Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            View all your saved job posts.
          </Typography>
        </ButtonBase>

        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardNavy}`}
          onClick={() => navigate(ROUTE_PATHS.jobs)}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box className={styles.quickCardIconFrameNavy} aria-hidden="true">
              <Box component="img" src={seoLineIcon} alt="" className={styles.quickCardIcon} />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>Latest Jobs</Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            View all the latest job posts.
          </Typography>
        </ButtonBase>

        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardPurple}`}
          onClick={() => {
            const path = quickLinks.find((item) => item.label.toLowerCase().includes('applications'))?.path
            navigate(path ?? ROUTE_PATHS.jobs)
          }}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box className={styles.quickCardIconFrameNeutral} aria-hidden="true">
              <Box component="img" src={bardLineIcon} alt="" className={styles.quickCardIcon} />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>Recommended Jobs</Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            View recommended jobs for you.
          </Typography>
        </ButtonBase>
      </Box>

      <Box component="section" className={styles.applicationsSection}>
        <Typography component="h2" className={styles.sectionTitle}>
          My applications
        </Typography>
        <Box className={styles.applicationsList}>
          {applications.length === 0 ? (
            <Typography component="p" className={styles.emptyApplications}>
              No applications yet. Start applying to jobs!
            </Typography>
          ) : (
            applications.map((apiApp, index) => {
              const app = transformApplicationToDisplay(apiApp)
              return (
                <Box key={app.id} className={styles.applicationEntry}>
                  {!index && null}
                  <Box className={styles.applicationHeader}>
                    <Box className={styles.applicationTitleRow}>
                      <Typography component="h3" className={styles.applicationTitle}>
                        {app.title}
                      </Typography>
                      <ButtonBase
                        type="button"
                        className={styles.expandButton}
                        aria-label={`View details for ${app.title}`}
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
                      <Box className={`${styles.pipelineFill} ${getPipelineFillClassName(app.pipelineStage)}`} />
                    </Box>
                  </Box>

                  <Typography component="p" className={styles.applicationMessage}>
                    {app.message}
                    <Link href={ROUTE_PATHS.jobs} className={styles.applicationMessageLink}>
                      View jobs
                    </Link>
                  </Typography>
                </Box>
              )
            })
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default CandidateDashboardPage
