import { Box, Button } from '@mui/material'
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
        <span className={styles.buttonArrow} aria-hidden="true">&larr;</span>
        Back
      </Button>
      <Button type="button" onClick={onNext} className={styles.nextButton} disabled={isNextDisabled}>
        Next
        <span className={styles.buttonArrow} aria-hidden="true">&rarr;</span>
      </Button>
    </Box>
  </Box>
)

export default CvBuilderFooterActions
