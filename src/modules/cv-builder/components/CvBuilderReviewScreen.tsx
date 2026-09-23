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
import type { CvBuilderFormValues } from "@/app/validation.schema";

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

type CvBuilderReviewScreenProps = {
  title?: string;
  description?: string;
  visitorId?: string;
  isVisitor?: boolean;
  showGenerateSkills?: boolean;
};

const CvBuilderReviewScreen = ({
  title = "Build Your CV.",
  description = "Use the fields below to build your CV.",
  visitorId,
  isVisitor = false,
  showGenerateSkills = true,
}: CvBuilderReviewScreenProps) => {
  const { control } = useFormContext<CvBuilderFormValues>();
  // Single shared instance so the header's "Generate" action and the list stay in sync.
  const skillsFieldArray = useFieldArray({ control, name: "skills" });

  const REVIEW_SECTIONS: ReviewSectionConfig[] = [
    {
      id: "personal",
      label: "Personal Details",
      icon: userIcon,
      renderContent: () => (
        <CvBuilderPersonalDetailsForm isVisitor={isVisitor} />
      ),
    },
    {
      id: "career",
      label: "Career History",
      icon: buildingIcon,
      renderContent: () => <CvBuilderCareerHistoryForm />,
    },
    {
      id: "skills",
      label: "Skills",
      icon: skillsIcon,
      renderHeaderAction: showGenerateSkills
        ? () => (
            <CvBuilderSkillsGenerateAction
              replaceSkills={skillsFieldArray.replace}
              visitorId={visitorId}
            />
          )
        : undefined,
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
        <Typography className={styles.reviewTitle}>{title}</Typography>
        <Typography className={styles.reviewDescription}>
          {description}
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
