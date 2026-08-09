import { Box, Typography } from "@mui/material";
import patternOne from "@/assets/cv-builder/pattern-1.svg";
import patternTwo from "@/assets/cv-builder/pattern-2.svg";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderHeroSectionProps = {
  totalSteps: number;
  activeStepId: number;
};

const CvBuilderHeroSection = ({
  totalSteps,
  activeStepId,
}: CvBuilderHeroSectionProps) => (
  <Box component="section" className={styles.heroSection}>
    <Box
      component="img"
      src={patternOne}
      alt=""
      className={styles.heroPattern1}
      aria-hidden="true"
    />
    <Box
      component="img"
      src={patternTwo}
      alt=""
      className={styles.heroPattern2}
      aria-hidden="true"
    />
    <Box className={styles.heroContent}>
      <Box className={styles.stepsIndicator}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className={`${styles.step} ${index + 1 === activeStepId ? styles.stepActive : ""}`}
          />
        ))}
      </Box>
      <Typography component="h1" className={styles.heroHeading}>
        CV Builder
      </Typography>
    </Box>
  </Box>
);

export default CvBuilderHeroSection;
