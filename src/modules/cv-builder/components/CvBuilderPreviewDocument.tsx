import { Box, Typography } from "@mui/material";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";
import {
  FALLBACK_WORK_DESCRIPTION,
  NOT_PROVIDED_TEXT,
  getValueOrFallback,
  normalizeCareerHistory,
  normalizeSkills,
} from "../utils/cvPreviewHelpers";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderPreviewDocumentProps = {
  size: "compact" | "full";
  formValues: CvBuilderFormValues["personalDetails"];
  careerHistory: CvBuilderFormValues["careerHistory"];
  skills: CvBuilderFormValues["skills"];
  tertiaryEducation: CvBuilderFormValues["tertiaryEducation"];
  secondaryEducation: CvBuilderFormValues["secondaryEducation"];
  selectedLanguageEntries: string[];
};

const CvBuilderPreviewDocument = ({
  size,
  formValues,
  careerHistory,
  skills,
  tertiaryEducation,
  secondaryEducation,
  selectedLanguageEntries,
}: CvBuilderPreviewDocumentProps) => {
  const previewFullName = formValues.fullName || "Candidate";
  const previewRole = getValueOrFallback(
    formValues.currentPosition,
    "Role not provided",
  );
  const previewCompany = getValueOrFallback(
    formValues.currentCompany,
    "Company not provided",
  );
  const employmentEquityStatus =
    [formValues.race, formValues.gender].filter(Boolean).join(" ") ||
    NOT_PROVIDED_TEXT;
  const normalizedCareerHistory = normalizeCareerHistory(careerHistory);
  const normalizedSkills = normalizeSkills(skills);
  const currentYear = new Date().getFullYear();
  const careerStartYears = normalizedCareerHistory
    .map((entry) => {
      const match = entry.startDate.match(/\b(19|20)\d{2}\b/);
      return match ? Number(match[0]) : null;
    })
    .filter((value): value is number => value !== null);
  const earliestCareerStartYear =
    careerStartYears.length > 0 ? Math.min(...careerStartYears) : null;
  const calculatedYearsOfExperience =
    earliestCareerStartYear == null
      ? 0
      : Math.max(currentYear - earliestCareerStartYear, 0);
  const yearsOfExperience = `${calculatedYearsOfExperience} Years`;
  const highestQualification =
    tertiaryEducation.find((entry) => entry.degreeOrCertification.trim())
      ?.degreeOrCertification || NOT_PROVIDED_TEXT;
  const industryExperience =
    normalizedCareerHistory
      .flatMap((entry) => entry.projects)
      .map((project) => project.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") || NOT_PROVIDED_TEXT;
  const languageSummary =
    selectedLanguageEntries.join(", ") || NOT_PROVIDED_TEXT;

  const formatPeriod = (
    startDate: string,
    endDate: string,
    isCurrentRole: boolean,
  ) => {
    const start = startDate.trim() || "N/A";
    const end = isCurrentRole ? "Current" : endDate.trim() || "N/A";
    return `${start} - ${end}`;
  };

  const fullDocument = (
    <Box
      className={`${styles.previewPageDocument} ${size === "compact" ? styles.previewPageDocumentCompact : ""}`}
    >
      <Box className={styles.previewPageBody}>
        <Typography className={styles.previewPageCvTitle}>
          Curriculum Vitae
        </Typography>
        <Typography className={styles.previewPageName}>
          {previewFullName}
        </Typography>

        <Typography className={styles.previewPageSectionTitle}>
          Personal Profile
        </Typography>
        <Box className={styles.previewPageGrid}>
          <Typography>Job Application</Typography>
          <Typography>{previewRole}</Typography>
          <Typography>Full Name</Typography>
          <Typography>{previewFullName}</Typography>
          <Typography>Employment Equity Status</Typography>
          <Typography>{employmentEquityStatus}</Typography>
          <Typography>Disability</Typography>
          <Typography>
            {getValueOrFallback(formValues.disabilityStatus)}
          </Typography>
          <Typography>Nationality</Typography>
          <Typography>{getValueOrFallback(formValues.nationality)}</Typography>
          <Typography>Residential Location</Typography>
          <Typography>
            {getValueOrFallback(formValues.residentialLocation)}
          </Typography>
          <Typography>Current Company</Typography>
          <Typography>{previewCompany}</Typography>
          <Typography>Current Position</Typography>
          <Typography>{previewRole}</Typography>
          <Typography>Notice Period</Typography>
          <Typography>{getValueOrFallback(formValues.noticePeriod)}</Typography>
        </Box>

        <Typography className={styles.previewPageSectionTitle}>
          Candidate Overview
        </Typography>
        <Box className={styles.previewPageOverviewLines}>
          <Box className={styles.previewPageOverviewRow}>
            <Typography className={styles.previewPageOverviewLabel}>
              Years of experience
            </Typography>
            <Typography>Overall: {yearsOfExperience}</Typography>
          </Box>
          <Box className={styles.previewPageOverviewRow}>
            <Typography className={styles.previewPageOverviewLabel}>
              Highest Qualification
            </Typography>
            <Typography>{highestQualification}</Typography>
          </Box>
          <Box className={styles.previewPageOverviewRow}>
            <Typography className={styles.previewPageOverviewLabel}>
              Industry Experience
            </Typography>
            <Typography>{industryExperience}</Typography>
          </Box>
          <Box className={styles.previewPageOverviewRow}>
            <Typography className={styles.previewPageOverviewLabel}>
              Languages
            </Typography>
            <Typography>{languageSummary}</Typography>
          </Box>
        </Box>

        <Typography className={styles.previewPageSectionTitle}>
          Tertiary Education
        </Typography>
        <Box className={styles.previewPageEducationHeadingRow}>
          <Typography>Institution</Typography>
          <Typography>Year Completed</Typography>
          <Typography>Degree / Certificate Name</Typography>
        </Box>
        {tertiaryEducation.map((entry, i) => (
          <Box key={i} className={styles.previewPageEducationRow}>
            <Typography>{getValueOrFallback(entry.institutionName)}</Typography>
            <Typography>{getValueOrFallback(entry.yearCompleted)}</Typography>
            <Typography>
              {getValueOrFallback(entry.degreeOrCertification)}
            </Typography>
          </Box>
        ))}

        <Typography className={styles.previewPageSectionTitle}>
          Secondary Education
        </Typography>
        <Box className={styles.previewPageEducationHeadingRow}>
          <Typography>Institution</Typography>
          <Typography>Year Completed</Typography>
          <Typography>Highest grade passed</Typography>
        </Box>
        {secondaryEducation.map((entry, i) => (
          <Box key={i} className={styles.previewPageEducationRow}>
            <Typography>{getValueOrFallback(entry.institutionName)}</Typography>
            <Typography>{getValueOrFallback(entry.yearCompleted)}</Typography>
            <Typography>
              {getValueOrFallback(entry.highestGradePassed)}
            </Typography>
          </Box>
        ))}

        <Box className={styles.previewPageDivider} />

        <Typography className={styles.previewPageSectionTitle}>
          Career Overview
        </Typography>
        <Box className={styles.previewPageCareerTableHeader}>
          <Typography>Company</Typography>
          <Typography>Period</Typography>
          <Typography>Position Held</Typography>
        </Box>
        {normalizedCareerHistory.length > 0 ? (
          normalizedCareerHistory.map((entry, entryIdx) => (
            <Box key={entryIdx} className={styles.previewPageCareerTableRow}>
              <Typography>{getValueOrFallback(entry.companyName)}</Typography>
              <Typography>
                {formatPeriod(
                  entry.startDate,
                  entry.endDate,
                  entry.isCurrentRole,
                )}
              </Typography>
              <Typography>{getValueOrFallback(entry.positionHeld)}</Typography>
            </Box>
          ))
        ) : (
          <Box className={styles.previewPageCareerTableRow}>
            <Typography>{NOT_PROVIDED_TEXT}</Typography>
            <Typography>{NOT_PROVIDED_TEXT}</Typography>
            <Typography>{NOT_PROVIDED_TEXT}</Typography>
          </Box>
        )}

        <Typography className={styles.previewPageSectionTitle}>
          Key Skills
        </Typography>
        {normalizedSkills.length > 0 ? (
          <Box component="ul" className={styles.previewPageSkillsList}>
            {normalizedSkills.map((skill) => (
              <Box key={skill} component="li">
                {skill}
              </Box>
            ))}
          </Box>
        ) : (
          <Box component="ul" className={styles.previewPageSkillsList}>
            <Box component="li">{NOT_PROVIDED_TEXT}</Box>
          </Box>
        )}

        <Typography className={styles.previewPageSectionTitle}>
          Languages
        </Typography>
        <Typography className={styles.previewPageLanguageText}>
          {languageSummary}
        </Typography>

        <Box className={styles.previewPageDivider} />

        <Typography className={styles.previewPageSectionTitle}>
          Work Experience
        </Typography>
        {normalizedCareerHistory.length > 0 ? (
          normalizedCareerHistory.map((entry, entryIdx) => {
            const descriptionItems = [
              ...entry.tasks,
              ...entry.projects.map((project) => `Project: ${project}`),
            ];

            return (
              <Box
                key={`work-${entryIdx}`}
                className={styles.previewPageWorkEntry}
              >
                <Box className={styles.previewPageWorkMetaGrid}>
                  <Typography className={styles.previewPageWorkMetaLabel}>
                    Company Name
                  </Typography>
                  <Typography>
                    {getValueOrFallback(entry.companyName)}
                  </Typography>
                  <Typography className={styles.previewPageWorkMetaLabel}>
                    Position Held
                  </Typography>
                  <Typography>
                    {getValueOrFallback(entry.positionHeld)}
                  </Typography>
                  <Typography className={styles.previewPageWorkMetaLabel}>
                    Period
                  </Typography>
                  <Typography>
                    {formatPeriod(
                      entry.startDate,
                      entry.endDate,
                      entry.isCurrentRole,
                    )}
                  </Typography>
                </Box>

                <Typography className={styles.previewPageWorkDescriptionTitle}>
                  Description:
                </Typography>
                {descriptionItems.length > 0 ? (
                  <Box
                    component="ul"
                    className={styles.previewPageWorkBulletList}
                  >
                    {descriptionItems.map((item, index) => (
                      <Box key={`desc-${entryIdx}-${index}`} component="li">
                        {item}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    component="ul"
                    className={styles.previewPageWorkBulletList}
                  >
                    {FALLBACK_WORK_DESCRIPTION.map((item, fbIdx) => (
                      <Box key={`fallback-${entryIdx}-${fbIdx}`} component="li">
                        {item}
                      </Box>
                    ))}
                  </Box>
                )}

                <Box className={styles.previewPageDivider} />
              </Box>
            );
          })
        ) : (
          <Box className={styles.previewPageWorkEntry}>
            <Box className={styles.previewPageWorkMetaGrid}>
              <Typography className={styles.previewPageWorkMetaLabel}>
                Company Name
              </Typography>
              <Typography>{NOT_PROVIDED_TEXT}</Typography>
              <Typography className={styles.previewPageWorkMetaLabel}>
                Position Held
              </Typography>
              <Typography>{NOT_PROVIDED_TEXT}</Typography>
              <Typography className={styles.previewPageWorkMetaLabel}>
                Period
              </Typography>
              <Typography>{NOT_PROVIDED_TEXT}</Typography>
            </Box>

            <Typography className={styles.previewPageWorkDescriptionTitle}>
              Description:
            </Typography>
            <Box component="ul" className={styles.previewPageWorkBulletList}>
              {FALLBACK_WORK_DESCRIPTION.map((item) => (
                <Box key={`fallback-${item}`} component="li">
                  {item}
                </Box>
              ))}
            </Box>

            <Box className={styles.previewPageDivider} />
          </Box>
        )}
      </Box>
    </Box>
  );

  if (size === "compact") {
    return (
      <Box className={styles.reviewPreviewMiniViewport}>
        <Box className={styles.reviewPreviewMiniScale}>{fullDocument}</Box>
      </Box>
    );
  }

  return fullDocument;
};

export default CvBuilderPreviewDocument;
