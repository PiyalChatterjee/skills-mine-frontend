import { Box, Button, Typography } from "@mui/material";
import { type ReactNode, useState } from "react";
import buildingIcon from "@/assets/cv-builder/building-line.svg";
import educationIcon from "@/assets/cv-builder/education-line.svg";
import languagesIcon from "@/assets/cv-builder/languages-line.svg";
import minusIcon from "@/assets/cv-builder/minus-line.svg";
import plusIcon from "@/assets/cv-builder/plus-line.svg";
import skillsIcon from "@/assets/cv-builder/skills-sparkle.svg";
import userIcon from "@/assets/public-layout/user-icon.svg";
import CvBuilderCareerHistoryForm from "./CvBuilderCareerHistoryForm";
import CvBuilderEducationForm from "./CvBuilderEducationForm";
import CvBuilderLanguagesForm from "./CvBuilderLanguagesForm";
import CvBuilderPersonalDetailsForm from "./CvBuilderPersonalDetailsForm";
import CvBuilderSkillsForm from "./CvBuilderSkillsForm";
import styles from "../pages/CvBuilderPage.module.css";

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
  renderContent: () => ReactNode;
};

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
    renderContent: () => <CvBuilderSkillsForm />,
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

const CvBuilderReviewScreen = () => {
  const [expandedSections, setExpandedSections] = useState<
    Set<ReviewSectionId>
  >(new Set(["personal"]));

  const toggleSection = (sectionId: ReviewSectionId) => {
    setExpandedSections((current) => {
      const next = new Set(current);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  };

  return (
    <Box className={styles.reviewLayout}>
      <Box className={styles.reviewMainColumn}>
        <Typography className={styles.reviewTitle}>Review your CV.</Typography>
        <Typography className={styles.reviewDescription}>
          Excellent job! Your CV has been successfully created. Please take a
          moment to review your details to ensure their accuracy.
        </Typography>

        <Box className={styles.reviewSectionsList}>
          {REVIEW_SECTIONS.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <Box key={section.id} className={styles.reviewSectionItem}>
                <Button
                  type="button"
                  className={`${styles.reviewSectionToggle} no-global-hover`}
                  disableRipple
                  onClick={() => toggleSection(section.id)}
                >
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
                  <Box
                    component="img"
                    src={isExpanded ? minusIcon : plusIcon}
                    alt=""
                    className={styles.reviewSectionExpandIcon}
                    aria-hidden="true"
                  />
                </Button>

                {isExpanded && (
                  <Box className={styles.reviewSectionContent}>
                    <Box className={styles.reviewEmbeddedSectionContent}>
                      {section.renderContent()}
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

    </Box>
  );
};

export default CvBuilderReviewScreen;
