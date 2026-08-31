import { Typography } from "@mui/material";
import { GradientPatternHero } from "@/components/hero";
import styles from "../pages/CvBuilderPage.module.css";

const CvBuilderHeroSection = () => (
  <GradientPatternHero height={200}>
    <Typography component="h1" className={styles.heroHeading}>
      CV Builder
    </Typography>
  </GradientPatternHero>
);

export default CvBuilderHeroSection;
