import { Box, Typography } from '@mui/material'
import patternOne from '@/assets/cv-builder/pattern-1.svg'
import patternTwo from '@/assets/cv-builder/pattern-2.svg'
import styles from '../pages/CvBuilderPage.module.css'

const CvBuilderHeroSection = () => (
  <Box component="section" className={styles.heroSection}>
    <Box component="img" src={patternOne} alt="" className={styles.heroPattern1} aria-hidden="true" />
    <Box component="img" src={patternTwo} alt="" className={styles.heroPattern2} aria-hidden="true" />
    <Box className={styles.heroContent}>
      <Box className={styles.stepsIndicator}>
        <span className={`${styles.step} ${styles.stepActive}`} />
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className={styles.step} />
        ))}
      </Box>
      <Typography component="h1" className={styles.heroHeading}>
        CV Builder
      </Typography>
    </Box>
  </Box>
)

export default CvBuilderHeroSection
