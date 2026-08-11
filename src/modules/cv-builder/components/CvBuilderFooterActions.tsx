import { Box, Button, Typography } from '@mui/material'
import arrowRight from '@/assets/cv-builder/arrow-right.svg'
import styles from '../pages/CvBuilderPage.module.css'

type CvBuilderFooterActionsProps = {
  onBack: () => void
  onNext: () => void
  isNextDisabled: boolean
  nextLabel?: string
  showNextIcon?: boolean
  subLabel?: string
}

const CvBuilderFooterActions = ({
  onBack,
  onNext,
  isNextDisabled,
  nextLabel = 'Next',
  showNextIcon = true,
  subLabel,
}: CvBuilderFooterActionsProps) => (
  <Box className={styles.footerBar}>
    <Box className={styles.footerBarInner}>
      <Button type="button" onClick={onBack} className={`${styles.backButton} no-global-hover`} disableRipple>
        <Box component="img" src={arrowRight} alt="" className={styles.buttonArrowBack} aria-hidden="true" />
        Back
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Button type="button" onClick={onNext} className={styles.nextButton} disabled={isNextDisabled} disableRipple>
          {nextLabel}
          {showNextIcon ? (
            <Box component="img" src={arrowRight} alt="" className={styles.buttonArrowNext} aria-hidden="true" />
          ) : null}
        </Button>
        {subLabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {subLabel}
          </Typography>
        )}
      </Box>
    </Box>
  </Box>
)

export default CvBuilderFooterActions
