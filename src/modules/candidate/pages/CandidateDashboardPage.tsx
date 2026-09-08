import { Fragment } from "react";
import {
  Box,
  ButtonBase,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  DASHBOARD_APPLICATION_STATUS_CONFIG,
  useCandidateDashboardViewModel,
} from "@/modules/candidate/hooks/useCandidateDashboardViewModel";
import { usePageTitle } from "@/hooks/usePageTitle";
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

const CandidateDashboardPage = () => {
  const navigate = useNavigate();
  const {
    applications,
    firstName,
    isLoading,
    isNewUser,
    statistics,
  } = useCandidateDashboardViewModel();

  usePageTitle(`${firstName} Dashboard`);

  const handleSkillsBuildClick = () => {
    window.open("https://skillsbuild.org/", "_blank");
  };

  const statCards = [
    {
      value: statistics.totalApplications,
      icon: fileList2LineIcon,
      label: "Applications",
      description: "Applications you have submitted through The Skills Mine",
      colorClass: styles.statCardBlue,
    },
    {
      value: statistics.successfulApplications,
      icon: verifiedBadgeLineIcon,
      label: "Successful",
      description: "Successful applications through The Skills Mine",
      colorClass: styles.statCardGreen,
    },
    {
      value: statistics.inProgressApplications,
      icon: progress5LineIcon,
      label: "In Progress",
      description: "Applications in progress through The Skills Mine",
      colorClass: styles.statCardTealMuted,
    },
  ];

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
        </Box>

        <Box component="section" className={styles.emptyQuickActionsRow}>
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

          <ButtonBase
            type="button"
            className={`${styles.quickCard} ${styles.quickCardBlue}`}
            onClick={handleSkillsBuildClick}
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
            applications.map((app, index) => {
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
                        {DASHBOARD_APPLICATION_STATUS_CONFIG[app.status].label}
                      </Box>
                    </Box>

                    <Box className={styles.pipelineWrap}>
                      <Box
                        className={styles.pipelineLabels}
                        style={{
                          gridTemplateColumns: `repeat(${app.pipelineStages.length}, minmax(0, 1fr))`,
                        }}
                      >
                        {app.pipelineStages.map((stage) => (
                          <span
                            key={stage.key}
                            className={styles.pipelineLabel}
                            data-active={stage.isActive || undefined}
                          >
                            {stage.label}
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
