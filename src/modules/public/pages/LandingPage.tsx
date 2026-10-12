import {
  Box,
  Button,
  Card,
  Skeleton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import aiIconUrl from "@/assets/landing-page/ai-icon.svg";
import chartIconUrl from "@/assets/landing-page/chart-icon.svg";
import patternOneUrl from "@/assets/landing-page/pattern-one.svg";
import patternThreeUrl from "@/assets/landing-page/pattern-three.svg";
import patternTwoUrl from "@/assets/landing-page/pattern-two.svg";
import shieldIconUrl from "@/assets/landing-page/shield-icon.svg";
import starIconUrl from "@/assets/landing-page/star-icon.svg";
import timeIconUrl from "@/assets/landing-page/time-icon.svg";
import {
  heroContent,
  LANDING_JOBS_PAGE_SIZE,
  type HeroMode,
} from "@/modules/public/constants/landingPage.constants";
import {
  OpportunitiesSearchInput,
  OpportunityJobCard,
} from "@/components/jobs";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useJobsSearch } from "@/modules/public/hooks/useJobsSearch";
import { useSearchQueryState } from "@/hooks/useSearchQueryState";
import { getJobTags } from "@/components/jobs/jobPresentation";
import type { PublicLayoutOutletContext } from "@/layouts/PublicLayout";
import { setLandingMode } from "@/store/slices/uiSlice";
import styles from "./LandingPage.module.css";

type Feature = {
  id: string;
  label: string;
  iconSrc: string;
};

type Metric = {
  id: string;
  value: string;
  label: string;
  cardClassName: string;
};

const features: Feature[] = [
  { id: "1", label: "ATS-Optimised CVs", iconSrc: shieldIconUrl },
  { id: "2", label: "Suitability Scores", iconSrc: chartIconUrl },
  { id: "3", label: "5 Minute Signup", iconSrc: timeIconUrl },
  { id: "4", label: "Personalised Recommendations", iconSrc: starIconUrl },
];

const metrics: Metric[] = [
  {
    id: "1",
    value: "2500+",
    label: "Active Roles",
    cardClassName: styles.metricCardWideLeft,
  },
  {
    id: "2",
    value: "85%",
    label: "Match Rate",
    cardClassName: styles.metricCardNarrow,
  },
  {
    id: "3",
    value: "14 Days",
    label: "Average Time to Hire",
    cardClassName: styles.metricCardWideRight,
  },
];

const LandingDefaultHero = ({ onSignUp }: { onSignUp: () => void }) => {
  const content = heroContent.findJob;
  return (
    <>
      <Box className={styles.heroBadge}>
        <img src={aiIconUrl} alt="" className={styles.heroBadgeIcon} aria-hidden="true" />
        <Typography component="span" className={styles.heroBadgeText} sx={{ m: 0 }}>
          {content.badge}
        </Typography>
      </Box>
      <Box className={styles.heroTextBlock}>
        <Typography component="h1" className={styles.heroTitle} sx={{ m: 0 }}>
          <Box component="span" className={styles.heroTitleStrong}>{content.titleStrong}</Box>{" "}
          <Box component="span" className={styles.heroTitleLight}>{content.titleLight}</Box>
        </Typography>
        <Box className={styles.heroCopy}>
          {content.copy.map((line) => (
            <Typography key={line} component="p" className={styles.heroText} sx={{ m: 0 }}>{line}</Typography>
          ))}
        </Box>
      </Box>
      <Box className={styles.heroCtaGroup}>
        <Button variant="contained" className={styles.heroCta} onClick={onSignUp}>{content.primaryCta}</Button>
      </Box>
      <Box className={styles.metricsGrid}>
        {metrics.map((metric) => (
          <Card key={metric.id} className={metric.cardClassName} elevation={0}>
            <Typography component="p" className={styles.metricValue} sx={{ m: 0 }}>{metric.value}</Typography>
            <Typography component="p" className={styles.metricLabel} sx={{ m: 0 }}>{metric.label}</Typography>
          </Card>
        ))}
      </Box>
    </>
  );
};

type LandingJobResultsProps = {
  query: ReturnType<typeof useJobsSearch>;
  shouldFilter: boolean;
  onSignUp: () => void;
};

const LandingJobResults = ({ query, shouldFilter, onSignUp }: LandingJobResultsProps) => {
  if (query.isJobsError) {
    return <Typography component="p" className={styles.sectionSubtitle} sx={{ mt: 2, mb: 0 }}>{query.jobsError?.message || "Failed to load jobs."}</Typography>;
  }
  if (query.isJobsLoading) {
    return (
      <Box className={styles.cardGrid} aria-live="polite" aria-busy="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className={styles.jobCardSkeleton} elevation={0}>
            <Skeleton variant="text" width="70%" height={32} />
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" width="85%" height={20} />
            <Box className={styles.jobCardSkeletonTags}>
              <Skeleton variant="rounded" width={70} height={28} />
              <Skeleton variant="rounded" width={70} height={28} />
              <Skeleton variant="rounded" width={70} height={28} />
            </Box>
          </Card>
        ))}
      </Box>
    );
  }
  if (!query.allJobs) return null;
  if (query.visibleJobs.length === 0) {
    return <Typography component="p" className={styles.sectionSubtitle} sx={{ mt: 2, mb: 0 }}>{shouldFilter ? "No jobs found for your search." : "No jobs available right now."}</Typography>;
  }
  return (
    <>
      <Box className={styles.cardGrid}>
        {query.visibleJobs.map((job) => (
          <OpportunityJobCard key={job.jobId} title={job.title} description={job.description ?? ""} tags={getJobTags(job)} actionLabel="Sign Up to View" onAction={onSignUp} />
        ))}
      </Box>
      {query.hasNextPage && (
        <Box className={styles.jobsLoadTriggerWrap} aria-live="polite">
          <Button type="button" variant="outlined" className={styles.loadMoreButton} onClick={() => void query.fetchNextPage()} disabled={query.isFetchingNextPage} aria-busy={query.isFetchingNextPage} disableRipple>
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </Box>
      )}
    </>
  );
};

const LandingPage = () => {
  usePageTitle("Strategic Recruitment Solutions Home");
  const { openSignUpDrawer } = useOutletContext<PublicLayoutOutletContext>();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  // Set by the CV builder after a visitor applies to a job. Snapshotted once so it
  // survives the history-state clear below, instead of being read fresh on every render.
  const [appliedJobState] = useState(
    () => location.state as { visitorId?: string; matchScore?: number } | null,
  );
  const { visitorId, matchScore } = appliedJobState ?? {};
  const [isApplicationSubmittedDismissed, setIsApplicationSubmittedDismissed] =
    useState(false);
  const [isDeclineConfirmationVisible, setIsDeclineConfirmationVisible] = useState(false);
  const [activeHeroMode] = useState<HeroMode>("findJob");
  const {
    inputValue: searchInputValue,
    normalizedValue: normalizedSearchTerm,
    debouncedValue: debouncedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    handleInputChange: handleSearchChange,
    clear: handleClearSearch,
  } = useSearchQueryState({
    minCharacters: 3,
    debounceMs: 250,
  });

  const jobsQuery = useJobsSearch({
    normalizedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    debouncedSearchTerm,
    pageSize: LANDING_JOBS_PAGE_SIZE,
  });

  useEffect(() => {
    dispatch(setLandingMode(activeHeroMode));

    return () => {
      dispatch(setLandingMode("findJob"));
    };
  }, [activeHeroMode, dispatch]);

  // Strip the visitor-apply state from history so a hard refresh (or revisiting "/"
  // later) shows the normal landing page instead of re-showing "Application submitted."
  useEffect(() => {
    if (appliedJobState) {
      void navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeroCtaClick = () => {
    openSignUpDrawer();
  };

  const handleCardCtaClick = () => {
    openSignUpDrawer();
  };

  const handleKeepCvOnFile = () => {
    openSignUpDrawer();
  };

  const handleDeclineKeepCvOnFile = () => {
    setIsDeclineConfirmationVisible(true);
  };

  useEffect(() => {
    if (!isDeclineConfirmationVisible) return;
    const timer = window.setTimeout(() => {
      setIsApplicationSubmittedDismissed(true);
      setIsDeclineConfirmationVisible(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [isDeclineConfirmationVisible]);

  return (
    <Box className={styles.pageRoot}>
      <Box component="section" className={styles.heroSection}>
        <img
          src={patternOneUrl}
          alt=""
          className={styles.heroPatternOne}
          aria-hidden="true"
        />
        <img
          src={patternTwoUrl}
          alt=""
          className={styles.heroPatternTwo}
          aria-hidden="true"
        />
        <img
          src={patternThreeUrl}
          alt=""
          className={styles.heroPatternThree}
          aria-hidden="true"
        />

        <Box className={`${styles.heroInner} ${isDeclineConfirmationVisible ? styles.declineHeroInner : ""}`}>
          {isDeclineConfirmationVisible ? (
            <Box className={styles.declineConfirmation} role="status" aria-live="polite">
              <Typography component="h1" className={styles.declineHeading}>
                Thanks For Applying
              </Typography>
              <Typography component="p" className={styles.declineMessage}>
                We will be in touch about the status of your application via email.
              </Typography>
              <Typography component="p" className={styles.declineMessage}>
                We hope to see you again soon, and good luck!
              </Typography>
              <Typography component="p" className={styles.declineRedirect}>
                Redirecting you back home...
              </Typography>
            </Box>
          ) : null}
          {!isDeclineConfirmationVisible && (visitorId && !isApplicationSubmittedDismissed ? (
            <>
              <Box className={styles.applicationSubmittedRow}>
                <Box
                  className={styles.matchBadge}
                  style={{ ["--match-pct" as string]: matchScore ?? 100 }}
                  aria-hidden="true"
                >
                  <Typography component="p" className={styles.matchBadgePercent} sx={{ m: 0 }}>
                    {matchScore != null ? `${matchScore}%` : "—"}
                  </Typography>
                </Box>
                <Box className={styles.applicationSubmittedText}>
                  <Typography component="h1" className={styles.applicationHeading} sx={{ m: 0 }}>
                    Application submitted.
                  </Typography>
                  {matchScore != null && (
                    <Typography component="p" className={styles.applicationSubtitle} sx={{ m: 0 }}>
                      You are a {matchScore}% match for this role.
                    </Typography>
                  )}
                </Box>
              </Box>

              <Typography component="p" className={styles.retentionText} sx={{ m: 0 }}>
                We would like to keep your CV on file so that we can alert you about similar roles in the future.
              </Typography>

              <Box className={styles.retentionActions}>
                <Button
                  variant="contained"
                  className={styles.heroCta}
                  onClick={handleKeepCvOnFile}
                >
                  Yes please
                </Button>
                <Button
                  variant="outlined"
                  className={styles.retentionDeclineCta}
                  onClick={handleDeclineKeepCvOnFile}
                >
                  No thanks
                </Button>
              </Box>

              <Box className={styles.retentionDivider} />

              <Box className={styles.heroTextBlock}>
                <Typography component="h2" className={styles.heroTitle} sx={{ m: 0 }}>
                  <Box component="span" className={styles.heroTitleStrong}>
                    Sign up to find your perfect role,
                  </Box>{" "}
                  <Box component="span" className={styles.heroTitleLight}>
                    matched to you.
                  </Box>
                </Typography>

                <Box className={styles.heroCopy}>
                  {heroContent.findJob.copy.slice(1).map((line) => (
                    <Typography key={line} component="p" className={styles.heroText} sx={{ m: 0 }}>
                      {line}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Box className={styles.heroCtaGroup}>
                <Button
                  variant="contained"
                  className={styles.heroCta}
                  onClick={handleHeroCtaClick}
                >
                  Sign up and Browse Jobs
                </Button>
              </Box>
            </>
          ) : (
            <LandingDefaultHero onSignUp={handleHeroCtaClick} />
          ))}
        </Box>
      </Box>

      <Box component="section" className={styles.featureBar}>
        <Box className={styles.featureBarInner}>
          {features.map((feature) => (
            <Box key={feature.id} className={styles.featureItem}>
              <img
                src={feature.iconSrc}
                alt=""
                className={styles.featureIcon}
                aria-hidden="true"
              />
              <Typography
                component="span"
                className={styles.featureText}
                sx={{ m: 0 }}
              >
                {feature.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {activeHeroMode === "findJob" ? (
        <Box component="section" className={styles.opportunitiesSection}>
          <Box className={styles.sectionHeader}>
            <Box className={styles.sectionHeadingGroup}>
              <Typography
                component="h2"
                className={styles.sectionTitle}
                sx={{ m: 0 }}
              >
                Latest Opportunities
              </Typography>
              <Typography
                component="p"
                className={styles.sectionSubtitle}
                sx={{ m: 0 }}
              >
                Sign up to reveal employer details and apply
              </Typography>
            </Box>
            <Box className={styles.searchWrap}>
              <OpportunitiesSearchInput
                value={searchInputValue}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
              />
            </Box>
          </Box>

          <LandingJobResults query={jobsQuery} shouldFilter={shouldFilterOpportunities} onSignUp={handleCardCtaClick} />
        </Box>
      ) : null}
    </Box>
  );
};

export default LandingPage;
