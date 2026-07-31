import { Box, Button } from '@mui/material'
import arrowRight from '@/assets/cv-builder/arrow-right.svg'
import styles from '../pages/CvBuilderPage.module.css'

type CvBuilderFooterActionsProps = {
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
}

const CvBuilderFooterActions = ({ onBack, onNext, isNextDisabled }: CvBuilderFooterActionsProps) => (
  <Box className={styles.footerBar}>
    <Box className={styles.footerBarInner}>
      <Button type="button" onClick={onBack} className={styles.backButton}>
        <Box component="img" src={arrowRight} alt="" className={styles.buttonArrowBack} aria-hidden="true" />
        Back
      </Button>
      <Button type="button" onClick={onNext} className={styles.nextButton} disabled={isNextDisabled}>
        Next
        <Box component="img" src={arrowRight} alt="" className={styles.buttonArrowNext} aria-hidden="true" />
      </Button>
    </Box>
  </Box>
)

export default CvBuilderFooterActions
