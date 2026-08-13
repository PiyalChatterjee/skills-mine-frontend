import { Box, Typography } from "@mui/material";
import { GradientPatternHero } from "@/components/hero";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderHeroSectionProps = {
  totalSteps: number;
  activeStepId: number;
};

const CvBuilderHeroSection = ({
  totalSteps,
  activeStepId,
}: CvBuilderHeroSectionProps) => (
  <GradientPatternHero height={200}>
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
  </GradientPatternHero>
);

export default CvBuilderHeroSection;
