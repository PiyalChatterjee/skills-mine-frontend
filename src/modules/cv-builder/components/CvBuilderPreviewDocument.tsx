import { Box, Typography } from "@mui/material";
import type {
  CareerHistoryEntry,
  Language,
  PersonalDetailsFormState,
  SecondaryEducationEntry,
  SkillEntry,
  TertiaryEducationEntry,
} from "../types/cvBuilder";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderPreviewDocumentProps = {
  size: "compact" | "full";
  formValues: PersonalDetailsFormState;
  careerHistory: CareerHistoryEntry[];
  skills: SkillEntry[];
  tertiaryEducation: TertiaryEducationEntry[];
  secondaryEducation: SecondaryEducationEntry[];
  selectedLanguages: Set<Language>;
};

const CvBuilderPreviewDocument = ({
  size,
  formValues,
  careerHistory,
  skills,
  tertiaryEducation,
  secondaryEducation,
  selectedLanguages,
}: CvBuilderPreviewDocumentProps) => {
  const previewFullName = formValues.fullName || "Candidate";
  const previewRole = formValues.currentPosition || "Role not provided";
  const previewCompany = formValues.currentCompany || "Company not provided";
  const employmentEquityStatus =
    [formValues.race, formValues.gender].filter(Boolean).join(" ") ||
    "Not provided";
  const normalizedCareerHistory = careerHistory
    .map((entry) => ({
      ...entry,
      tasks: entry.tasks.map((task) => task.trim()).filter(Boolean),
      projects: entry.projects.map((project) => project.trim()).filter(Boolean),
    }))
    .filter(
      (entry) =>
        entry.companyName.trim() ||
        entry.positionHeld.trim() ||
        entry.startDate.trim() ||
        entry.endDate.trim() ||
        entry.tasks.length > 0 ||
        entry.projects.length > 0,
    );

  const normalizedSkills = skills
    .map((entry) => entry.name.trim())
    .filter(Boolean);
  const fallbackWorkDescription = [
    "No responsibilities provided yet.",
    "No achievements provided yet.",
  ];
  const yearsOfExperience = `${Math.max(normalizedCareerHistory.length, 1)} Years`;
  const highestQualification =
    tertiaryEducation.find((entry) => entry.degreeOrCertification.trim())
      ?.degreeOrCertification || "Not provided";
  const industryExperience =
    normalizedCareerHistory
      .flatMap((entry) => entry.projects)
      .map((project) => project.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") || "Not provided";
  const languageSummary =
    Array.from(selectedLanguages).join(", ") || "Not provided";

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
            {formValues.disabilityStatus || "Not provided"}
          </Typography>
          <Typography>Nationality</Typography>
          <Typography>{formValues.nationality || "Not provided"}</Typography>
          <Typography>Residential Location</Typography>
          <Typography>
            {formValues.residentialLocation || "Not provided"}
          </Typography>
          <Typography>Current Company</Typography>
          <Typography>{previewCompany}</Typography>
          <Typography>Current Position</Typography>
          <Typography>{previewRole}</Typography>
          <Typography>Notice Period</Typography>
          <Typography>{formValues.noticePeriod || "Not provided"}</Typography>
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
        {tertiaryEducation.map((entry) => (
          <Box key={entry.id} className={styles.previewPageEducationRow}>
            <Typography>{entry.institutionName || "Not provided"}</Typography>
            <Typography>{entry.yearCompleted || "Not provided"}</Typography>
            <Typography>
              {entry.degreeOrCertification || "Not provided"}
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
        {secondaryEducation.map((entry) => (
          <Box key={entry.id} className={styles.previewPageEducationRow}>
            <Typography>{entry.institutionName || "Not provided"}</Typography>
            <Typography>{entry.yearCompleted || "Not provided"}</Typography>
            <Typography>
              {entry.highestGradePassed || "Not provided"}
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
          normalizedCareerHistory.map((entry) => (
            <Box key={entry.id} className={styles.previewPageCareerTableRow}>
              <Typography>{entry.companyName || "Not provided"}</Typography>
              <Typography>
                {formatPeriod(
                  entry.startDate,
                  entry.endDate,
                  entry.isCurrentRole,
                )}
              </Typography>
              <Typography>{entry.positionHeld || "Not provided"}</Typography>
            </Box>
          ))
        ) : (
          <Box className={styles.previewPageCareerTableRow}>
            <Typography>Not provided</Typography>
            <Typography>Not provided</Typography>
            <Typography>Not provided</Typography>
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
            <Box component="li">Not provided</Box>
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
          normalizedCareerHistory.map((entry) => {
            const descriptionItems = [
              ...entry.tasks,
              ...entry.projects.map((project) => `Project: ${project}`),
            ];

            return (
              <Box
                key={`${entry.id}-work`}
                className={styles.previewPageWorkEntry}
              >
                <Box className={styles.previewPageWorkMetaGrid}>
                  <Typography className={styles.previewPageWorkMetaLabel}>
                    Company Name
                  </Typography>
                  <Typography>{entry.companyName || "Not provided"}</Typography>
                  <Typography className={styles.previewPageWorkMetaLabel}>
                    Position Held
                  </Typography>
                  <Typography>
                    {entry.positionHeld || "Not provided"}
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
                      <Box key={`${entry.id}-desc-${index}`} component="li">
                        {item}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    component="ul"
                    className={styles.previewPageWorkBulletList}
                  >
                    {fallbackWorkDescription.map((item) => (
                      <Box key={`${entry.id}-${item}`} component="li">
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
              <Typography>Not provided</Typography>
              <Typography className={styles.previewPageWorkMetaLabel}>
                Position Held
              </Typography>
              <Typography>Not provided</Typography>
              <Typography className={styles.previewPageWorkMetaLabel}>
                Period
              </Typography>
              <Typography>Not provided</Typography>
            </Box>

            <Typography className={styles.previewPageWorkDescriptionTitle}>
              Description:
            </Typography>
            <Box component="ul" className={styles.previewPageWorkBulletList}>
              {fallbackWorkDescription.map((item) => (
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
