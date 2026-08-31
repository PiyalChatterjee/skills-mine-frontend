import { Box, ButtonBase, Typography } from "@mui/material";
import arrowRight from "@/assets/cv-builder/arrow-right.svg";
import { GradientPatternHero } from "@/components/hero";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderHeroSectionProps = {
  onBack?: () => void;
};

const CvBuilderHeroSection = ({ onBack }: CvBuilderHeroSectionProps) => (
  <GradientPatternHero height={200}>
    {onBack && (
      <ButtonBase
        type="button"
        className={styles.heroBackButton}
        onClick={onBack}
        disableRipple
      >
        <span className={styles.heroBackButtonIconWrap} aria-hidden="true">
          <Box component="img" src={arrowRight} alt="" className={styles.heroBackButtonArrow} />
        </span>
        <span>Back</span>
      </ButtonBase>
    )}
    <Typography component="h1" className={styles.heroHeading}>
      CV Builder
    </Typography>
  </GradientPatternHero>
);

export default CvBuilderHeroSection;
