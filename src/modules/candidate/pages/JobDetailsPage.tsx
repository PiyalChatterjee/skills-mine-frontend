import { useMemo } from "react";
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import arrowLeftFill from "@/assets/job-details/arrow-left-fill.svg";
import patternHeroLeft from "@/assets/job-details/pattern-hero-left.svg";
import patternHeroRight from "@/assets/job-details/pattern-hero-right.svg";
import { BookmarkIcon } from "@/components/icons/BookmarkIcon";
import { GradientPatternHero } from "@/components/hero";
import { useJobs } from "@/modules/public/hooks/useJobs";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { useOptimisticSaveJob } from "@/modules/candidate/hooks/useOptimisticSaveJob";
import { useAppliedJobIds } from "@/modules/candidate/hooks/useAppliedJobIds";
import type { Job } from "@/types";
import styles from "./JobDetailsPage.module.css";

type LocationState = {
  job?: Job;
  from?: string;
};

const allowedBackRoutes = new Set<string>([
  ROUTE_PATHS.latestJobs,
  ROUTE_PATHS.savedJobs,
  ROUTE_PATHS.recommendedJobs,
  ROUTE_PATHS.candidateDashboard,
]);
const fallbackSkillPalette = [
  "#cabee9",
  "#efb5b5",
  "#80c0e8",
  "#93cfab",
  "#6891ba",
];

const toCityFromLocation = (location?: string) => {
  if (!location) return "Johannesburg";
  const [city] = location.split(",");
  return city?.trim() || "Johannesburg";
};

const toDisplayTitle = (value: string | undefined, fallback: string) => {
  if (!value || value.trim().length === 0) return fallback;
  return value;
};

const formatPostedDate = (dateValue?: string) => {
  if (!dateValue) return "12 November 2025";

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "12 November 2025";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const location = useLocation();
  const { isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob();
  const { isJobApplied } = useAppliedJobIds();

  const { data, isLoading, isError } = useJobs(undefined, true, 50);

  const locationState = location.state as LocationState | null;
  const stateJob = locationState?.job;
  const backRoute =
    locationState?.from && allowedBackRoutes.has(locationState.from)
      ? locationState.from
      : ROUTE_PATHS.latestJobs;

  const allJobs = useMemo(() => {
    return (data?.pages ?? []).flatMap((page) => page.jobs);
  }, [data]);

  const resolvedJob = useMemo(() => {
    if (stateJob && stateJob.jobId === jobId) {
      return stateJob;
    }

    if (!jobId) {
      return stateJob;
    }

    return allJobs.find((job) => job.jobId === jobId) ?? stateJob;
  }, [allJobs, jobId, stateJob]);

  const isSaved = resolvedJob ? isJobSaved(resolvedJob.jobId) : false;
  const isSaving = resolvedJob ? isJobSaving(resolvedJob.jobId) : false;
  const isApplied = resolvedJob ? isJobApplied(resolvedJob.jobId) : false;

  if (isLoading && !resolvedJob) {
    return (
      <Box
        className={styles.pageRoot}
        sx={{ display: "grid", placeItems: "center", py: 10 }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!resolvedJob || isError) {
    return (
      <Box className={styles.pageRoot} sx={{ p: 4 }}>
        <Typography component="p" className={styles.stateText}>
          We could not find this job post.
        </Typography>
        <Button
          variant="contained"
          className={styles.footerApply}
          sx={{ mt: 2 }}
          onClick={() => navigate(ROUTE_PATHS.latestJobs)}
        >
          Back to latest jobs
        </Button>
      </Box>
    );
  }

  const title = toDisplayTitle(resolvedJob.title, "");
  const companyName = toDisplayTitle(resolvedJob.company, "");
  const industry = toDisplayTitle(resolvedJob.industry, "");
  const locationName = toCityFromLocation(resolvedJob.location);
  const workType = toDisplayTitle(resolvedJob.workType, "");
  const employmentType = toDisplayTitle(resolvedJob.employmentType, "");
  const requirements =
    resolvedJob.requirements && resolvedJob.requirements.length > 0
      ? resolvedJob.requirements
      : [];
  const responsibilities =
    resolvedJob.responsibilities && resolvedJob.responsibilities.length > 0
      ? resolvedJob.responsibilities
      : [];
  const skills =
    resolvedJob.skills && resolvedJob.skills.length > 0
      ? resolvedJob.skills.slice(0, 5)
      : [
          "User Experience Strategy",
          "Design Thinking",
          "Team Collaboration",
          "Interaction Design",
          "User Research",
        ];

  return (
    <Box className={styles.pageRoot}>
      <GradientPatternHero
        height={380}
        className={styles.heroSection}
        rightPatternClassName={styles.heroPatternRight}
        leftPatternClassName={styles.heroPatternLeft}
        rightPatternSrc={patternHeroRight}
        leftPatternSrc={patternHeroLeft}
      >
        <Box className={styles.heroInner}>
          <Box className={styles.headerRow}>
            <ButtonBase
              type="button"
              className={styles.backButton}
              disableRipple
              onClick={() => navigate(backRoute)}
            >
              <img
                src={arrowLeftFill}
                alt=""
                className={styles.backButtonArrow}
                aria-hidden="true"
              />
              Back
            </ButtonBase>

            <Typography component="h1" className={styles.jobTitle}>
              {title}
            </Typography>

            <Box className={styles.heroActions}>
              <IconButton
                type="button"
                className={styles.heroSaveButton}
                aria-label={isSaved ? `Unsave ${title}` : `Save ${title}`}
                onClick={() => {
                  void toggleJobSaved(resolvedJob.jobId);
                }}
                disabled={isSaving}
              >
                <BookmarkIcon
                  filled={isSaved}
                  className={styles.heroSaveIcon}
                />
              </IconButton>

              <Button
                variant="contained"
                className={styles.applyButton}
                disabled={isApplied}
              >
                {isApplied ? "Applied" : "Apply now"}
              </Button>
            </Box>
          </Box>

          <Box className={styles.tagsRow}>
            {[industry, locationName, workType, employmentType].map((tag) => (
              <span key={tag} className={styles.heroTag}>
                {tag}
              </span>
            ))}
          </Box>
        </Box>
      </GradientPatternHero>

      <Box component="section" className={styles.contentSection}>
        <Typography component="h2" className={styles.sectionTitle}>
          Job description
        </Typography>

        <Box className={styles.contentRow}>
          <Box className={styles.metaCard}>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Company Name
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {companyName}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Employment type
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {employmentType}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Experience
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                3 to 5 years
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Salary
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {resolvedJob.salaryRange || "Negotiable"}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Job published
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {formatPostedDate(resolvedJob.postedDate)}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Job Reference No.
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {resolvedJob.jobId}
              </Typography>
            </Box>
          </Box>

          <Box className={styles.detailsColumn}>
            <Box>
              <Typography component="h3" className={styles.subSectionTitle}>
                Requirements
              </Typography>
              <ul className={styles.bulletList}>
                {requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Box>

            <Box>
              <Typography component="h3" className={styles.subSectionTitle}>
                Responsibilities
              </Typography>
              <ul className={styles.bulletList}>
                {responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Box>

            <Box>
              <Typography component="h3" className={styles.subSectionTitle}>
                Skills
              </Typography>
              <Box className={styles.skillsWrap}>
                {skills.map((skill, index) => (
                  <span
                    key={skill}
                    className={styles.skillTag}
                    style={{
                      background:
                        fallbackSkillPalette[
                          index % fallbackSkillPalette.length
                        ],
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography component="h3" className={styles.subSectionTitle}>
                Industries
              </Typography>
              <span className={styles.industryTag}>{industry}</span>
            </Box>
          </Box>
        </Box>

        <Box className={styles.footerActions}>
          <Button
            variant="contained"
            className={styles.footerApply}
            disabled={isApplied}
          >
            {isApplied ? "Applied" : "Apply now"}
          </Button>
          <Button
            variant="outlined"
            className={styles.footerSave}
            onClick={() => {
              void toggleJobSaved(resolvedJob.jobId);
            }}
          >
            {isSaved ? "Saved" : "Save"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default JobDetailsPage;
