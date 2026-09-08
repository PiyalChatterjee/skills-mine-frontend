import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import arrowLeftFill from "@/assets/job-details/arrow-left-fill.svg";
import patternHeroLeft from "@/assets/job-details/pattern-hero-left.svg";
import patternHeroRight from "@/assets/job-details/pattern-hero-right.svg";
import { BookmarkIcon } from "@/components/icons/BookmarkIcon";
import { GradientPatternHero } from "@/components/hero";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useJobDetailsViewModel } from "@/modules/candidate/hooks/useJobDetailsViewModel";
import styles from "./JobDetailsPage.module.css";

const fallbackSkillPalette = [
  "#cabee9",
  "#efb5b5",
  "#80c0e8",
  "#93cfab",
  "#6891ba",
];

const JobDetailsPage = () => {
  const {
    applyButtonLabel,
    applyError,
    companyName,
    description,
    employmentType,
    footerSaveLabel,
    handleApply,
    handleBack,
    handleBackToLatest,
    handleToggleSave,
    industry,
    isApplied,
    isApplying,
    isAuthenticated,
    isInitialLoading,
    isNotFound,
    isSaved,
    isSaving,
    jobReferenceNumber,
    locationName,
    postedDate,
    requirements,
    responsibilities,
    salaryRange,
    saveAriaLabel,
    skills,
    title,
    workType,
  } = useJobDetailsViewModel();

  usePageTitle(title ? `${title}${companyName ? ` at ${companyName}` : ""}` : "Job Details");

  if (isInitialLoading) {
    return (
      <Box
        className={styles.pageRoot}
        sx={{ display: "grid", placeItems: "center", py: 10 }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isNotFound) {
    return (
      <Box className={styles.pageRoot} sx={{ p: 4 }}>
        <Typography component="p" className={styles.stateText}>
          We could not find this job post.
        </Typography>
        <Button
          variant="contained"
          className={styles.footerApply}
          sx={{ mt: 2 }}
          onClick={handleBackToLatest}
        >
          Back to latest jobs
        </Button>
      </Box>
    );
  }

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
                onClick={handleBack}
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
                  aria-label={saveAriaLabel}
                  onClick={handleToggleSave}
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
                  {applyButtonLabel}
                </Button>
              </Box>
            )}
          </Box>

          <Box className={styles.tagsRow}>
            {[industry, locationName, workType, employmentType]
              .filter((tag): tag is string => Boolean(tag))
              .map((tag) => (
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

        {description ? (
          <Typography component="p" className={styles.description}>
            {description}
          </Typography>
        ) : null}

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
                {salaryRange}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Job published
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {postedDate}
              </Typography>
            </Box>
            <Box className={styles.metaItem}>
              <Typography component="p" className={styles.metaLabel}>
                Job Reference No.
              </Typography>
              <Typography component="p" className={styles.metaValue}>
                {jobReferenceNumber}
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
            {applyButtonLabel}
          </Button>
          {isAuthenticated && (
            <Button
              variant="outlined"
              className={styles.footerSave}
              onClick={handleToggleSave}
            >
              {footerSaveLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default JobDetailsPage;
