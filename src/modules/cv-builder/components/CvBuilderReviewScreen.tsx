import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import buildingIcon from "@/assets/cv-builder/building-line.svg";
import educationIcon from "@/assets/cv-builder/education-line.svg";
import languagesIcon from "@/assets/cv-builder/languages-line.svg";
import skillsIcon from "@/assets/cv-builder/skills-sparkle.svg";
import userIcon from "@/assets/public-layout/user-icon.svg";
import CvBuilderCareerHistoryForm from "./CvBuilderCareerHistoryForm";
import CvBuilderEducationForm from "./CvBuilderEducationForm";
import CvBuilderLanguagesForm from "./CvBuilderLanguagesForm";
import CvBuilderPersonalDetailsForm from "./CvBuilderPersonalDetailsForm";
import CvBuilderSkillsForm from "./CvBuilderSkillsForm";
import CvBuilderSkillsGenerateAction from "./CvBuilderSkillsGenerateAction";
import styles from "../pages/CvBuilderPage.module.css";
import type { CvBuilderFormValues } from "../types/cvBuilderSchema";

type ReviewSectionId =
  | "personal"
  | "career"
  | "skills"
  | "education"
  | "languages";

type ReviewSectionConfig = {
  id: ReviewSectionId;
  label: string;
  icon: string;
  renderHeaderAction?: () => ReactNode;
  renderContent: () => ReactNode;
};

const CvBuilderReviewScreen = () => {
  const { control } = useFormContext<CvBuilderFormValues>();
  // Single shared instance so the header's "Generate" action and the list stay in sync.
  const skillsFieldArray = useFieldArray({ control, name: "skills" });

  const REVIEW_SECTIONS: ReviewSectionConfig[] = [
    {
      id: "personal",
      label: "Personal details",
      icon: userIcon,
      renderContent: () => <CvBuilderPersonalDetailsForm />,
    },
    {
      id: "career",
      label: "Career history",
      icon: buildingIcon,
      renderContent: () => <CvBuilderCareerHistoryForm />,
    },
    {
      id: "skills",
      label: "Skills",
      icon: skillsIcon,
      renderHeaderAction: () => (
        <CvBuilderSkillsGenerateAction
          replaceSkills={skillsFieldArray.replace}
        />
      ),
      renderContent: () => (
        <CvBuilderSkillsForm skillsFieldArray={skillsFieldArray} />
      ),
    },
    {
      id: "education",
      label: "Education",
      icon: educationIcon,
      renderContent: () => <CvBuilderEducationForm />,
    },
    {
      id: "languages",
      label: "Languages",
      icon: languagesIcon,
      renderContent: () => <CvBuilderLanguagesForm />,
    },
  ];

  return (
    <Box className={styles.reviewLayout}>
      <Box className={styles.reviewMainColumn}>
        <Typography className={styles.reviewTitle}>Review your CV.</Typography>
        <Typography className={styles.reviewDescription}>
          Excellent job! Your CV has been successfully created. Please take a
          moment to review your details to ensure their accuracy.
        </Typography>

        <Box className={styles.reviewSectionsList}>
          {REVIEW_SECTIONS.map((section) => (
            <Box key={section.id} className={styles.reviewSectionItem}>
              <Box className={styles.reviewSectionToggle}>
                  <Box
                    className={styles.reviewSectionIconBadge}
                    aria-hidden="true"
                  >
                    <Box
                      component="img"
                      src={section.icon}
                      alt=""
                      className={styles.reviewSectionIcon}
                    />
                  </Box>
                  <Typography className={styles.reviewSectionLabel}>
                    {section.label}
                  </Typography>
                  {section.renderHeaderAction?.()}
              </Box>
              <Box className={styles.reviewSectionContent}>
                <Box className={styles.reviewEmbeddedSectionContent}>
                  {section.renderContent()}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

    </Box>
  );
};

export default CvBuilderReviewScreen;
