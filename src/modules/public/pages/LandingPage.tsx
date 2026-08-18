import {
  Box,
  Button,
  CircularProgress,
  Card,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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
  type HeroMode,
} from "@/modules/public/constants/landingPage.constants";
import {
  OpportunitiesSearchInput,
  OpportunityJobCard,
} from "@/components/opportunities";
import { useInfiniteScrollTrigger } from "@/hooks/useInfiniteScrollTrigger";
import { useJobsSearch } from "@/modules/public/hooks/useJobsSearch";
import { useSearchQueryState } from "@/hooks/useSearchQueryState";
import type { PublicLayoutOutletContext } from "@/layouts/PublicLayout";
import { setLandingMode } from "@/store/slices/uiSlice";
import { useGetCandidateLandingQuery } from "@/store/api/apiSlice";
import { useOutletContext } from "react-router-dom";
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

const toCityFromLocation = (location: string) => {
  const [city] = location.split(",");
  return city?.trim() || "Unknown";
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

const LandingPage = () => {
  const { openSignUpDrawer } = useOutletContext<PublicLayoutOutletContext>();
  const dispatch = useDispatch();
  const { data: landingData } = useGetCandidateLandingQuery();
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

  const {
    allJobs,
    visibleJobs,
    isJobsError,
    jobsError,
    isJobsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useJobsSearch({
    normalizedSearchTerm,
    shouldFilter: shouldFilterOpportunities,
    shouldUseDebouncedQuery: shouldUseApiSearch,
    debouncedSearchTerm,
  });
  const jobsLoadTriggerRef = useInfiniteScrollTrigger({
    hasNextPage,
    isFetchingNextPage,
    isError: isJobsError,
    itemCount: visibleJobs.length,
    onLoadMore: fetchNextPage,
  });

  useEffect(() => {
    dispatch(setLandingMode(activeHeroMode));

    return () => {
      dispatch(setLandingMode("findJob"));
    };
  }, [activeHeroMode, dispatch]);

 /*  const handleFindJobClick = () => {
    setActiveHeroMode("findJob");
  };

  const handleStartHiringClick = () => {
    setActiveHeroMode("startHiring");
  }; */

  const handleHeroCtaClick = () => {
    openSignUpDrawer();
  };

  const handleHeroSecondaryCtaClick = () => {
    // TODO: Implement action
  };

  const handleCardCtaClick = () => {
    openSignUpDrawer();
  };

  const currentHeroContent = heroContent[activeHeroMode];
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

        <Box className={styles.heroInner}>
          <Box className={styles.heroBadge}>
            <img
              src={aiIconUrl}
              alt=""
              className={styles.heroBadgeIcon}
              aria-hidden="true"
            />
            <Typography
              component="span"
              className={styles.heroBadgeText}
              sx={{ m: 0 }}
            >
              {currentHeroContent.badge}
            </Typography>
          </Box>

          {/* <Box
            className={`${styles.heroSwitch} ${
              activeHeroMode === "findJob"
                ? styles.heroSwitchFindJob
                : styles.heroSwitchStartHiring
            }`}
            style={{
              ["--hero-switch-active-width" as string]: heroSwitchActiveWidth,
              ["--hero-switch-active-x" as string]: heroSwitchActiveX,
            }}
          >
            <Button
              ref={findJobButtonRef}
              type="button"
              variant="text"
              className={
                activeHeroMode === "findJob"
                  ? styles.heroSwitchActive
                  : styles.heroSwitchIdle
              }
              onClick={handleFindJobClick}
              aria-pressed={activeHeroMode === "findJob"}
              disableRipple
            >
              Find a job
            </Button>
            <Button
              ref={startHiringButtonRef}
              type="button"
              variant="text"
              className={
                activeHeroMode === "startHiring"
                  ? styles.heroSwitchActive
                  : styles.heroSwitchIdle
              }
              onClick={handleStartHiringClick}
              aria-pressed={activeHeroMode === "startHiring"}
              disableRipple
            >
              Start hiring
            </Button>
          </Box> */}

          <Box className={styles.heroTextBlock}>
            <Typography
              component="h1"
              className={styles.heroTitle}
              sx={{ m: 0 }}
            >
              <Box component="span" className={styles.heroTitleStrong}>
                {currentHeroContent.titleStrong}
              </Box>{" "}
              {"titleLight" in currentHeroContent &&
                currentHeroContent.titleLight && (
                  <Box component="span" className={styles.heroTitleLight}>
                    {currentHeroContent.titleLight}
                  </Box>
                )}
            </Typography>

            <Box className={styles.heroCopy}>
              {currentHeroContent.copy.map((line) => (
                <Typography
                  key={line}
                  component="p"
                  className={styles.heroText}
                  sx={{ m: 0 }}
                >
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
              {currentHeroContent.primaryCta}
            </Button>

            {activeHeroMode === "startHiring" ? (
              <Button
                variant="outlined"
                className={styles.heroSecondaryCta}
                onClick={handleHeroSecondaryCtaClick}
              >
                {heroContent.startHiring.secondaryCta}
              </Button>
            ) : null}
          </Box>

          <Box className={styles.metricsGrid}>
            {metrics.map((metric, index) => {
              const contractValues = landingData?.stats
                ? [
                    landingData.stats.totalJobs,
                    landingData.stats.totalCandidates,
                    landingData.stats.totalPlacements,
                  ]
                : [];

              return (
              <Card
                key={metric.id}
                className={metric.cardClassName}
                elevation={0}
              >
                <Typography
                  component="p"
                  className={styles.metricValue}
                  sx={{ m: 0 }}
                >
                  {contractValues[index] ?? metric.value}
                </Typography>
                <Typography
                  component="p"
                  className={styles.metricLabel}
                  sx={{ m: 0 }}
                >
                  {metric.label}
                </Typography>
              </Card>
              );
            })}
          </Box>
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

          {isJobsError ? (
            <Typography
              component="p"
              className={styles.sectionSubtitle}
              sx={{ mt: 2, mb: 0 }}
            >
              {jobsError?.message || "Failed to load jobs."}
            </Typography>
          ) : isJobsLoading ? (
            <Box className={styles.jobsLoadingState} aria-live="polite" aria-busy="true">
              <CircularProgress size={28} />
            </Box>
          ) : allJobs ? (
            visibleJobs.length > 0 ? (
              <>
                <Box className={styles.cardGrid}>
                  {visibleJobs.map((job) => (
                    <OpportunityJobCard
                      key={job.jobId}
                      title={job.title}
                      description={job.description ?? ""}
                      tags={[
                        job.industry,
                        toCityFromLocation(job.location ?? ""),
                        job.employmentType,
                      ].filter(Boolean) as string[]}
                      actionLabel="Sign Up to View"
                      onAction={handleCardCtaClick}
                    />
                  ))}
                </Box>
                {hasNextPage ? (
                  <Box className={styles.jobsLoadTriggerWrap} aria-live="polite">
                    <Box ref={jobsLoadTriggerRef} className={styles.jobsLoadTrigger} aria-hidden="true" />
                    <Typography component="p" className={styles.jobsLoadText} sx={{ m: 0 }}>
                      {isFetchingNextPage ? "Loading more opportunities..." : "Scroll to load more opportunities"}
                    </Typography>
                  </Box>
                ) : null}
              </>
            ) : (
              <Typography
                component="p"
                className={styles.sectionSubtitle}
                sx={{ mt: 2, mb: 0 }}
              >
                {shouldFilterOpportunities
                  ? "No jobs found for your search."
                  : "No jobs available right now."}
              </Typography>
            )
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default LandingPage;
