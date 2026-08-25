import { Fragment, useMemo } from "react";
import {
  Box,
  ButtonBase,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth/AuthContext";
import { useCandidateDashboardQuery, useCandidateStatisticsQuery } from "@/modules/candidate/hooks/useCandidateQueries";
import type { DashboardApplication } from "@/types/api";
import bardLineIcon from "@/assets/candidate-dashboard/bard-line.svg";
import expandCirclePlusIcon from "@/assets/candidate-dashboard/expand-circle-plus.svg";
import bookmarkLineIcon from "@/assets/candidate-dashboard/bookmark-line.svg";
import seoLineIcon from "@/assets/candidate-dashboard/seo-line.svg";
import settings4LineIcon from "@/assets/candidate-dashboard/settings-4-line.svg";
import fileList2LineIcon from "@/assets/candidate-dashboard/file-list-2-line.svg";
import progress5LineIcon from "@/assets/candidate-dashboard/progress-5-line.svg";
import verifiedBadgeLineIcon from "@/assets/candidate-dashboard/verified-badge-line.svg";
import { ROUTE_PATHS } from "@/routes/routePaths";
import styles from "./CandidateDashboardPage.module.css";

type ApplicationStatusKey =
  | "applied"
  | "screening"
  | "assessment"
  | "interview"
  | "shortlisted"
  | "offer_extended"
  | "offer_accepted"
  | "offer_declined"
  | "unknown";

const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatusKey,
  { label: string; color: string; caption?: string }
> = {
  applied: {
    label: "Applied",
    color: "#72c4e0",
    caption: "Your application has been submitted.",
  },
  screening: {
    label: "Screening",
    color: "#4db8c8",
    caption: "Your application is under review.",
  },
  assessment: {
    label: "Assessment",
    color: "#f0a500",
    caption: "You have been invited to complete an assessment.",
  },
  interview: {
    label: "Interview",
    color: "#7c5cd8",
    caption: "You have been selected for an interview.",
  },
  shortlisted: {
    label: "Shortlisted",
    color: "#e085c2",
    caption: "You have been shortlisted for this role.",
  },
  offer_extended: {
    label: "Offer",
    color: "#5bbf8a",
    caption: "You have received an offer.",
  },
  offer_accepted: {
    label: "Closed",
    color: "#4BAF73",
    caption: "You have accepted the offer.",
  },
  offer_declined: {
    label: "Closed",
    color: "#D64545",
    caption: "You have declined the offer.",
  },
  unknown: { label: "Unknown stage", color: "#7a8694" },
};

const STAGE_STATUS_MAP: Record<string, ApplicationStatusKey> = {
  // lowercase
  inbound: "applied",
  applied: "applied",
  screening: "screening",
  assessment: "assessment",
  interview: "interview",
  shortlisted: "shortlisted",
  offer: "offer_extended",
  offer_extended: "offer_extended",
  offer_accepted: "offer_accepted",
  offer_declined: "offer_declined",
};

// Pipeline stage label lookup – API keys are uppercase e.g. INTERVIEW
const PIPELINE_STAGE_LABEL: Record<string, string> = {
  applied: "Applied",
  screening: "Screening",
  assessment: "Assessment",
  interview: "Interview",
  shortlisted: "Shortlisted",
  offer: "Offer",
  placed: "Placed",
  closed: "Closed",
};

const getPipelineStageLabelFromKey = (key: string): string =>
  PIPELINE_STAGE_LABEL[key.toLowerCase()] ?? key;

// Returns 0-based index of current stage within the app's pipeline array
const getPipelineProgress = (
  stage: string | undefined | null,
  pipeline: string[],
): number => {
  if (!stage || pipeline.length === 0) return 0;
  const normalized = stage.toLowerCase();
  const idx = pipeline.findIndex((s) => s.toLowerCase() === normalized);
  return idx >= 0 ? idx : 0;
};

const CLOSED_STAGES = new Set(["closed", "offer_accepted", "offer_declined"]);

const getPipelineFillPercent = (
  stage: string | undefined | null,
  pipeline: string[],
): number => {
  if (pipeline.length <= 1) return 0;
  // Closed/accepted/declined stages mean the process is complete
  if (stage && CLOSED_STAGES.has(stage.toLowerCase())) {
    return 100;
  }
  const idx = getPipelineProgress(stage, pipeline);
  // Align bar to center of current stage label
  return Math.round(((idx + 0.5) / pipeline.length) * 100);
};

const unknownStages = new Set<string>();

const reportUnknownStage = (stage: string) => {
  const normalized = stage.trim().toLowerCase();
  if (!unknownStages.has(normalized)) {
    unknownStages.add(normalized);
    console.warn(
      "[CandidateDashboardPage] Unknown application stage received from API",
      {
        stage,
        normalized,
      },
    );
  }
};

const mapStageToStatusKey = (
  stage: string | undefined | null,
): ApplicationStatusKey => {
  if (!stage) return "unknown";
  const normalized = stage.trim().toLowerCase();
  const mapped = STAGE_STATUS_MAP[normalized];
  if (mapped) {
    return mapped;
  }

  reportUnknownStage(stage);
  return "unknown";
};

type DisplayApplication = {
  id: string;
  jobId: string;
  title: string;
  status: ApplicationStatusKey;
  stage: string;
  pipeline: string[];
  fillPercent: number;
  message: string;
  offerAccepted: boolean;
};

const transformApplicationToDisplay = (
  app: DashboardApplication,
): DisplayApplication => {
  const status = mapStageToStatusKey(app.stage);

  return {
    id: app.id,
    jobId: app.job.id,
    title: `${app.job.title} at ${app.job.company}`,
    status,
    stage: app.stage,
    pipeline: app.pipeline,
    fillPercent: getPipelineFillPercent(app.stage, app.pipeline),
    message: app.statusMessage,
    offerAccepted: false,
  };
};

const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dashboard, isLoading } = useCandidateDashboardQuery(Boolean(user));
  const { data: statistics } = useCandidateStatisticsQuery(Boolean(user));

  const statCards = useMemo(() => {
    const stats = statistics?.statistics;
    return [
      {
        value: stats?.totalApplications ?? 0,
        icon: fileList2LineIcon,
        label: "Applications",
        description: "Applications you have submitted through The Skills Mine",
        colorClass: styles.statCardBlue,
      },
      {
        value: stats?.successfulApplications ?? 0,
        icon: verifiedBadgeLineIcon,
        label: "Successful",
        description: "Successful applications through The Skills Mine",
        colorClass: styles.statCardGreen,
      },
      {
        value: stats?.inProgressApplications ?? 0,
        icon: progress5LineIcon,
        label: "In Progress",
        description: "Applications in progress through The Skills Mine",
        colorClass: styles.statCardTealMuted,
      },
    ];
  }, [statistics]);

  const firstName = user?.firstName ?? "there";
  const applications = dashboard?.applications ?? [];
  const isNewUser =
    !isLoading &&
    applications.length === 0 &&
    (statistics?.statistics?.totalApplications ?? 0) === 0;

  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (isNewUser) {
    return (
      <Box className={styles.pageRoot}>
        <Box component="section" className={styles.emptyHeroBanner}>
          <Typography component="p" className={styles.emptyHeroGreeting}>
            Hi {firstName}
          </Typography>
          <Typography component="h1" className={styles.emptyHeroMessage}>
            You haven&apos;t applied for any jobs yet.
          </Typography>
          <ButtonBase
            type="button"
            className={styles.emptyHeroCta}
            onClick={() => navigate(ROUTE_PATHS.jobs)}
            disableRipple
          >
            See matched jobs
          </ButtonBase>
        </Box>

        <Box component="section" className={styles.emptyQuickActionsRow}>
          <ButtonBase
            type="button"
            className={`${styles.quickCard} ${styles.quickCardBlue}`}
            onClick={() => navigate(ROUTE_PATHS.jobs)}
            disableRipple
          >
            <Box className={styles.quickCardHeader}>
              <Box className={styles.quickCardIconFrameBlue} aria-hidden="true">
                <Box
                  component="img"
                  src={settings4LineIcon}
                  alt=""
                  className={styles.quickCardIcon}
                />
              </Box>
              <Typography component="p" className={styles.quickCardTitle}>
                <span className={styles.quickCardTitleLine}>Skills</span>
                <span className={styles.quickCardTitleLine}>build</span>
              </Typography>
            </Box>
            <Typography component="p" className={styles.quickCardSubtitle}>
              Learn a skill to enhance your CV.
            </Typography>
          </ButtonBase>

          <ButtonBase
            type="button"
            className={`${styles.quickCard} ${styles.quickCardNavy}`}
            onClick={() => navigate(ROUTE_PATHS.latestJobs)}
            disableRipple
          >
            <Box className={styles.quickCardHeader}>
              <Box className={styles.quickCardIconFrameNavy} aria-hidden="true">
                <Box
                  component="img"
                  src={seoLineIcon}
                  alt=""
                  className={styles.quickCardIcon}
                />
              </Box>
              <Typography component="p" className={styles.quickCardTitle}>
                <span className={styles.quickCardTitleLine}>Latest</span>
                <span className={styles.quickCardTitleLine}>Jobs</span>
              </Typography>
            </Box>
            <Typography component="p" className={styles.quickCardSubtitle}>
              View all the latest job posts.
            </Typography>
          </ButtonBase>

          <ButtonBase
            type="button"
            className={`${styles.quickCard} ${styles.quickCardPurple}`}
            onClick={() => navigate(ROUTE_PATHS.recommendedJobs)}
            disableRipple
          >
            <Box className={styles.quickCardHeader}>
              <Box
                className={styles.quickCardIconFrameNeutral}
                aria-hidden="true"
              >
                <Box
                  component="img"
                  src={bardLineIcon}
                  alt=""
                  className={styles.quickCardIcon}
                />
              </Box>
              <Typography component="p" className={styles.quickCardTitle}>
                <span className={styles.quickCardTitleLine}>Recommended</span>
                <span className={styles.quickCardTitleLine}>Jobs</span>
              </Typography>
            </Box>
            <Typography component="p" className={styles.quickCardSubtitle}>
              View recommended jobs for you.
            </Typography>
          </ButtonBase>
        </Box>
      </Box>
    );
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
              <Box
                key={card.label}
                className={`${styles.statCard} ${card.colorClass}`}
              >
                <Box className={styles.statCardTop}>
                  <Typography component="p" className={styles.statValue}>
                    {card.value}
                  </Typography>
                  <Box className={styles.statIcon} aria-hidden="true">
                    <Box
                      component="img"
                      src={card.icon}
                      alt=""
                      className={styles.statIconImage}
                    />
                  </Box>
                </Box>
                <Typography component="p" className={styles.statLabel}>
                  {card.label}
                </Typography>
                <Typography component="p" className={styles.statDesc}>
                  {card.description}
                </Typography>
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
              <Box
                component="img"
                src={settings4LineIcon}
                alt=""
                className={styles.quickCardIcon}
              />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>
              <span className={styles.quickCardTitleLine}>CV</span>
              <span className={styles.quickCardTitleLine}>Builder</span>
            </Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            Build a professional CV in minutes.
          </Typography>
        </ButtonBase>

        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardTeal}`}
          onClick={() => navigate(ROUTE_PATHS.savedJobs)}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box className={styles.quickCardIconFrameTeal} aria-hidden="true">
              <Box
                component="img"
                src={bookmarkLineIcon}
                alt=""
                className={styles.quickCardIcon}
              />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>
              <span className={styles.quickCardTitleLine}>Saved</span>
              <span className={styles.quickCardTitleLine}>Jobs</span>
            </Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            View all your saved job posts.
          </Typography>
        </ButtonBase>

        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardNavy}`}
          onClick={() => navigate(ROUTE_PATHS.latestJobs)}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box className={styles.quickCardIconFrameNavy} aria-hidden="true">
              <Box
                component="img"
                src={seoLineIcon}
                alt=""
                className={styles.quickCardIcon}
              />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>
              <span className={styles.quickCardTitleLine}>Latest</span>
              <span className={styles.quickCardTitleLine}>Jobs</span>
            </Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            View all the latest job posts.
          </Typography>
        </ButtonBase>

        <ButtonBase
          type="button"
          className={`${styles.quickCard} ${styles.quickCardPurple}`}
          onClick={() => navigate(ROUTE_PATHS.recommendedJobs)}
          disableRipple
        >
          <Box className={styles.quickCardHeader}>
            <Box
              className={styles.quickCardIconFrameNeutral}
              aria-hidden="true"
            >
              <Box
                component="img"
                src={bardLineIcon}
                alt=""
                className={styles.quickCardIcon}
              />
            </Box>
            <Typography component="p" className={styles.quickCardTitle}>
              <span className={styles.quickCardTitleLine}>Recommended</span>
              <span className={styles.quickCardTitleLine}>Jobs</span>
            </Typography>
          </Box>
          <Typography component="p" className={styles.quickCardSubtitle}>
            View recommended jobs for you.
          </Typography>
        </ButtonBase>
      </Box>

      <Box component="section" className={styles.applicationsSection}>
        <Box className={styles.applicationsList}>
          <Box className={styles.applicationsHeader}>
            <Typography component="h2" className={styles.sectionTitle}>
              My applications
            </Typography>
          </Box>
          {applications.length === 0 ? (
            <Typography component="p" className={styles.emptyApplications}>
              No applications yet. Start applying to jobs!
            </Typography>
          ) : (
            applications.map((apiApp, index) => {
              const app = transformApplicationToDisplay(apiApp);
              return (
                <Fragment key={app.id}>
                  <Box className={styles.applicationEntry}>
                    <Box className={styles.applicationHeader}>
                      <Box className={styles.applicationTitleRow}>
                        <Typography
                          component="h3"
                          className={styles.applicationTitle}
                        >
                          {app.title}
                        </Typography>
                        <ButtonBase
                          type="button"
                          className={styles.expandButton}
                          aria-label={`View details for ${app.title}`}
                          disableRipple
                          disabled={!app.jobId}
                          onClick={() => {
                            if (!app.jobId) return;
                            navigate(
                              ROUTE_PATHS.jobDetails.replace(":jobId", app.jobId),
                              { state: { from: ROUTE_PATHS.candidateDashboard } },
                            );
                          }}
                        >
                          <Box
                            component="img"
                            src={expandCirclePlusIcon}
                            alt=""
                            className={styles.expandButtonIcon}
                            aria-hidden="true"
                          />
                        </ButtonBase>
                      </Box>
                      <Box className={styles.statusPill} data-status={app.status}>
                        {APPLICATION_STATUS_CONFIG[app.status].label}
                      </Box>
                    </Box>

                    <Box className={styles.pipelineWrap}>
                      <Box
                        className={styles.pipelineLabels}
                        style={{
                          gridTemplateColumns: `repeat(${app.pipeline.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {app.pipeline.map((stageKey) => (
                          <span
                            key={stageKey}
                            className={styles.pipelineLabel}
                            data-active={
                              stageKey.toLowerCase() ===
                                app.stage.toLowerCase() || undefined
                            }
                          >
                            {getPipelineStageLabelFromKey(stageKey)}
                          </span>
                        ))}
                      </Box>
                      <Box className={styles.pipelineTrack}>
                        <Box
                          className={`${styles.pipelineFill} ${(app.status === "offer_declined" || app.status === "offer_accepted") && styles.pipelineFillClosed}`}
                          style={{ width: `${app.fillPercent}%` }}
                        />
                      </Box>
                    </Box>

                    <Typography
                      component="p"
                      className={styles.applicationMessage}
                    >
                      {app.message}
                    </Typography>
                  </Box>

                  {index < applications.length - 1 ? (
                    <Box className={styles.applicationDivider} aria-hidden="true" />
                  ) : null}
                </Fragment>
              );
            })
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CandidateDashboardPage;
