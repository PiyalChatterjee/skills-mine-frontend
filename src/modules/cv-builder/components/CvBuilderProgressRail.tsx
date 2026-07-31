import { Box, Typography } from '@mui/material'
import styles from '../pages/CvBuilderPage.module.css'
import type { StepItem } from '../types/cvBuilder'

type CvBuilderProgressRailProps = {
  steps: StepItem[]
  activeStepId: number
}

const CvBuilderProgressRail = ({ steps, activeStepId }: CvBuilderProgressRailProps) => (
  <Box className={styles.progressRail}>
    {steps.map((step, index) => {
      const isActive = step.id === activeStepId

      return (
        <Box key={step.id} className={styles.progressItemWrap}>
          <Box className={styles.progressItem}>
            <Box className={`${styles.progressCircle} ${isActive ? styles.progressCircleActive : ''}`}>
              <Typography component="span" className={styles.progressNumber}>
                {step.id}
              </Typography>
            </Box>
            <Typography component="p" className={`${styles.progressLabel} ${isActive ? styles.progressLabelActive : ''}`}>
              {step.label}
            </Typography>
          </Box>
          {index < steps.length - 1 && <Box className={styles.progressConnector} aria-hidden="true" />}
        </Box>
      )
    })}
  </Box>
)

export default CvBuilderProgressRail
