import { Box, ButtonBase, Typography } from "@mui/material";
import arrowRight from "@/assets/cv-builder/arrow-right.svg";
import { GradientPatternHero } from "@/components/hero";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderHeroSectionProps = {
  onBack?: () => void;
  heading?: string;
  tags?: string[];
  isJobContext?: boolean;
};

const CvBuilderHeroSection = ({
  onBack,
  heading = "CV Builder",
  tags,
  isJobContext = false,
}: CvBuilderHeroSectionProps) => (
  <GradientPatternHero
    height={200}
    className={isJobContext ? styles.heroJobSection : undefined}
    contentClassName={isJobContext ? styles.heroJobContent : undefined}
  >
    {onBack && (
      <ButtonBase
        type="button"
        className={
          isJobContext ? styles.heroJobBackButton : styles.heroBackButton
        }
        onClick={onBack}
        disableRipple
      >
        <span className={styles.heroBackButtonIconWrap} aria-hidden="true">
          <Box component="img" src={arrowRight} alt="" className={styles.heroBackButtonArrow} />
        </span>
        <span>Back</span>
      </ButtonBase>
    )}
    <Typography
      component="h1"
      className={tags?.length ? styles.heroJobHeading : styles.heroHeading}
    >
      {heading}
    </Typography>
    {tags?.length ? (
      <Box className={styles.heroTagsRow}>
        {tags.map((tag) => (
          <span key={tag} className={styles.heroTag}>
            {tag}
          </span>
        ))}
      </Box>
    ) : null}
  </GradientPatternHero>
);

export default CvBuilderHeroSection;
