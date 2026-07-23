import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import aiIconUrl from "@/assets/landing-page/ai-icon.svg";
import bookmarkIconUrl from "@/assets/landing-page/bookmark-icon.svg";
import chartIconUrl from "@/assets/landing-page/chart-icon.svg";
import patternOneUrl from "@/assets/landing-page/pattern-one.svg";
import patternThreeUrl from "@/assets/landing-page/pattern-three.svg";
import patternTwoUrl from "@/assets/landing-page/pattern-two.svg";
import searchIconUrl from "@/assets/landing-page/search-icon.svg";
import shieldIconUrl from "@/assets/landing-page/shield-icon.svg";
import starIconUrl from "@/assets/landing-page/star-icon.svg";
import timeIconUrl from "@/assets/landing-page/time-icon.svg";
import {
  heroContent,
  type HeroMode,
} from "@/modules/public/constants/landingPage.constants";
import { useOpportunities } from "@/modules/public/hooks/useOpportunities";
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

const LandingPage = () => {
  const dispatch = useDispatch();
  const [activeHeroMode, setActiveHeroMode] = useState<HeroMode>("findJob");
  const [heroSwitchActiveWidth, setHeroSwitchActiveWidth] = useState("111px");
  const [heroSwitchActiveX, setHeroSwitchActiveX] = useState("4px");
  const findJobButtonRef = useRef<HTMLButtonElement | null>(null);
  const startHiringButtonRef = useRef<HTMLButtonElement | null>(null);

  const {
    data: opportunitiesData,
    isError: isOpportunitiesError,
    error: opportunitiesError,
  } = useOpportunities();

  useEffect(() => {
    const updateHeroSwitchMetrics = () => {
      const activeButton =
        activeHeroMode === "findJob"
          ? findJobButtonRef.current
          : startHiringButtonRef.current;

      if (!activeButton) {
        return;
      }

      setHeroSwitchActiveWidth(`${activeButton.offsetWidth}px`);
      setHeroSwitchActiveX(`${activeButton.offsetLeft}px`);
    };

    updateHeroSwitchMetrics();
    window.addEventListener("resize", updateHeroSwitchMetrics);

    return () => {
      window.removeEventListener("resize", updateHeroSwitchMetrics);
    };
  }, [activeHeroMode]);

  useEffect(() => {
    dispatch(setLandingMode(activeHeroMode));

    return () => {
      dispatch(setLandingMode("findJob"));
    };
  }, [activeHeroMode, dispatch]);

  const handleFindJobClick = () => {
    setActiveHeroMode("findJob");
  };

  const handleStartHiringClick = () => {
    setActiveHeroMode("startHiring");
  };

  const handleHeroCtaClick = () => {
    // TODO: Implement action
  };

  const handleHeroSecondaryCtaClick = () => {
    // TODO: Implement action
  };

  const handleSearchChange = () => {
    // TODO: Implement action
  };

  const handleBookmarkClick = () => {
    // TODO: Implement action
  };

  const handleCardCtaClick = () => {
    // TODO: Implement action
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

          <Box
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
          </Box>

          <Box className={styles.heroTextBlock}>
            <Typography
              component="h1"
              className={styles.heroTitle}
              sx={{ m: 0 }}
            >
              <Box component="span" className={styles.heroTitleStrong}>
                {currentHeroContent.titleStrong}
              </Box>{" "}
              {"titleLight" in currentHeroContent && currentHeroContent.titleLight && (
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
            {metrics.map((metric) => (
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
                  {metric.value}
                </Typography>
                <Typography
                  component="p"
                  className={styles.metricLabel}
                  sx={{ m: 0 }}
                >
                  {metric.label}
                </Typography>
              </Card>
            ))}
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
              <TextField
                className={styles.searchInput}
                placeholder="Search"
                aria-label="Search opportunities"
                variant="outlined"
                fullWidth
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box className={styles.searchIcon} aria-hidden="true">
                          <img
                            src={searchIconUrl}
                            alt=""
                            className={styles.searchIconImage}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>
          </Box>

          {isOpportunitiesError ? (
            <Typography
              component="p"
              className={styles.sectionSubtitle}
              sx={{ mt: 2, mb: 0 }}
            >
              {opportunitiesError?.message || "Failed to load opportunities."}
            </Typography>
          ) : opportunitiesData && opportunitiesData.length > 0 ? (
            <Box className={styles.cardGrid}>
              {opportunitiesData.map((job) => (
                <Card
                  component="article"
                  key={job.id}
                  className={`${styles.jobCard} ${job.tallCard ? styles.jobCardTall : styles.jobCardShort}`}
                  elevation={0}
                >
                  <Box className={styles.cardTop}>
                    <Box className={styles.cardHeader}>
                      <Typography
                        component="h3"
                        className={styles.cardTitle}
                        sx={{ m: 0 }}
                      >
                        {job.title}
                      </Typography>
                      <IconButton
                        type="button"
                        className={styles.bookmarkButton}
                        aria-label={`Save ${job.title}`}
                        onClick={handleBookmarkClick}
                        disableRipple
                      >
                        <img
                          src={bookmarkIconUrl}
                          alt=""
                          className={styles.bookmarkIcon}
                          aria-hidden="true"
                        />
                      </IconButton>
                    </Box>
                    <Box className={styles.cardRule} />
                  </Box>

                  <Box className={styles.cardBody}>
                    <Box className={styles.cardContentColumn}>
                      <Box className={styles.tagAndCopy}>
                        <Box className={styles.tagRow}>
                          {job.tags.map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              variant="outlined"
                              className={styles.tagChip}
                            />
                          ))}
                        </Box>

                        <Typography
                          component="p"
                          className={styles.cardDescription}
                          sx={{ m: 0 }}
                        >
                          {job.description}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        className={styles.cardCta}
                        onClick={handleCardCtaClick}
                      >
                        Sign Up to View
                      </Button>
                    </Box>

                    <Box className={styles.companyThumb} aria-hidden="true">
                      <Box
                        className={`${styles.companyOrbImage} ${styles.companyOrbImageBlurred}`}
                        style={{
                          ["--orb-core" as string]: job.employerOrbColor,
                          ["--orb-glow" as string]: job.employerOrbGlow,
                        }}
                      />
                      <Typography
                        component="span"
                        className={`${styles.companyName} ${styles.companyNameBlurred}`}
                        sx={{ m: 0 }}
                      >
                        {job.employerName}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
};

export default LandingPage;
