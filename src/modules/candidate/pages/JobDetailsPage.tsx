import { useMemo, useState } from "react";
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
import { useApplyToJobMutation, useGetJobByIdQuery, useGetJobProfileQuery } from "@/store/api/apiSlice";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { useOptimisticSaveJob } from "@/modules/candidate/hooks/useOptimisticSaveJob";
import { useAppliedJobIds } from "@/modules/candidate/hooks/useAppliedJobIds";
import { createGuestApplicationDraft } from "@/modules/candidate/utils/guestApplicationDraft";
import { useAuth } from "@/app/auth/AuthContext";
import { formatEnumLabel } from "@/app/formatEnumLabel";
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
  const { isAuthenticated, user } = useAuth();
  const { isJobSaved, isJobSaving, toggleJobSaved } = useOptimisticSaveJob();
  const { isJobApplied } = useAppliedJobIds();
  const [applyToJob, { isLoading: isApplying }] = useApplyToJobMutation();
  const [hasJustApplied, setHasJustApplied] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const { data, isLoading } = useJobs(undefined, true, 50);

  const locationState = location.state as LocationState | null;
  const stateJob = locationState?.job;
  const backRoute =
    locationState?.from && allowedBackRoutes.has(locationState.from)
      ? locationState.from
      : ROUTE_PATHS.latestJobs;

  const allJobs = useMemo(() => {
    return (data?.pages ?? []).flatMap((page) => page?.jobs ?? []);
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

  // Fetch the job directly by id — the list-derived resolvedJob may not be
  // ready yet (e.g. on a hard page reload), so this is the reliable source
  // of the jobProfileId needed to call the job profile API below.
  const { data: jobById } = useGetJobByIdQuery(jobId ?? "", { skip: !jobId });
  const jobProfileId = jobById?.jobProfileId ?? resolvedJob?.jobProfileId;

  // Fetch the full job profile as soon as the job is opened, rather than
  // relying solely on the (possibly partial) list-cached data.
  const { data: jobProfile, isFetching: isJobProfileLoading } =
    useGetJobProfileQuery(jobProfileId ?? "", {
      skip: !jobProfileId,
    });

  const displayJob = useMemo(() => {
    const base = resolvedJob ?? jobById;
    if (!base) return undefined;
    return { ...base, ...jobById, ...jobProfile, jobId: base.jobId };
  }, [resolvedJob, jobById, jobProfile]);

  const effectiveJob = resolvedJob ?? jobById;
  const isSaved = effectiveJob ? isJobSaved(effectiveJob.jobId) : false;
  const isSaving = effectiveJob ? isJobSaving(effectiveJob.jobId) : false;
  const isApplied = effectiveJob
    ? hasJustApplied || isJobApplied(effectiveJob.jobId)
    : false;

  const handleApply = async () => {
    if (!effectiveJob || isApplied || isApplying) return;
    setApplyError(null);

    if (!isAuthenticated) {
      createGuestApplicationDraft(effectiveJob);
      navigate(`${ROUTE_PATHS.cvBuilder}?job=${encodeURIComponent(effectiveJob.jobId)}`, {
        state: { guestApplicationJobId: effectiveJob.jobId },
      });
      return;
    }

    if (user?.role !== "JOB_SEEKER") {
      setApplyError("Only candidate accounts can apply for jobs.");
      return;
    }

    try {
      await applyToJob({ jobProfileId: effectiveJob.jobProfileId ?? effectiveJob.jobId }).unwrap();
      setHasJustApplied(true);
    } catch (error) {
      const message = typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "Unable to submit your application.")
        : "Unable to submit your application.";
      setApplyError(message);
    }
  };

  if ((isLoading || isJobProfileLoading) && !effectiveJob) {
    return (
      <Box
        className={styles.pageRoot}
        sx={{ display: "grid", placeItems: "center", py: 10 }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!effectiveJob) {
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

  const title = toDisplayTitle(displayJob?.title, "");
  const companyName = toDisplayTitle(displayJob?.company, "");
  const industry = toDisplayTitle(displayJob?.industry, "");
  const locationName = toCityFromLocation(displayJob?.location);
  const workType = formatEnumLabel(toDisplayTitle(displayJob?.workType, ""));
  const employmentType = formatEnumLabel(
    toDisplayTitle(displayJob?.employmentType, ""),
  );
  const requirements =
    displayJob?.requirements && displayJob.requirements.length > 0
      ? displayJob.requirements
      : [];
  const responsibilities =
    displayJob?.responsibilities && displayJob.responsibilities.length > 0
      ? displayJob.responsibilities
      : [];
  const skills =
    displayJob?.skills && displayJob.skills.length > 0
      ? displayJob.skills.slice(0, 5)
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
          <Box
            className={
              isAuthenticated ? styles.headerRow : styles.guestHeaderRow
            }
          >
            {isAuthenticated && (
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
            )}

            <Typography component="h1" className={styles.jobTitle}>
              {title}
            </Typography>

            {isAuthenticated && (
              <Box className={styles.heroActions}>
                <IconButton
                  type="button"
                  className={styles.heroSaveButton}
                  aria-label={isSaved ? `Unsave ${title}` : `Save ${title}`}
                  onClick={() => {
                    void toggleJobSaved(effectiveJob.jobId);
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
                  disabled={isApplying || isApplied}
                  onClick={() => void handleApply()}
                >
                  {isApplying ? "Applying..." : isApplied ? "Applied" : "Apply now"}
                </Button>
              </Box>
            )}
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
        {applyError ? (
          <Typography component="p" color="error" role="alert" sx={{ mb: 2 }}>
            {applyError}
          </Typography>
        ) : null}
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
                {displayJob?.salaryRange || "Negotiable"}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Job published
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {formatPostedDate(displayJob?.postedDate)}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Job Reference No.
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {effectiveJob.jobId}
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
            disabled={isApplying || isApplied}
            onClick={() => void handleApply()}
          >
            {isApplying ? "Applying..." : isApplied ? "Applied" : "Apply now"}
          </Button>
          {isAuthenticated && (
            <Button
              variant="outlined"
              className={styles.footerSave}
              onClick={() => {
                void toggleJobSaved(effectiveJob.jobId);
              }}
            >
              {isSaved ? "Saved" : "Save"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default JobDetailsPage;
