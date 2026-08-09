import { Box, Typography } from "@mui/material";
import styles from "../pages/CvBuilderPage.module.css";
import type { StepItem } from "../types/cvBuilder";

type CvBuilderProgressRailProps = {
  steps: StepItem[];
  activeStepId: number;
};

const CvBuilderProgressRail = ({
  steps,
  activeStepId,
}: CvBuilderProgressRailProps) => (
  <Box className={styles.progressRail}>
    {steps.map((step, index) => {
      const isActive = step.id === activeStepId;
      const isCompleted = step.id < activeStepId;

      return (
        <Box key={step.id} className={styles.progressItemWrap}>
          <Box className={styles.progressItem}>
            <Box
              className={`${styles.progressCircle} ${isCompleted ? styles.progressCircleCompleted : ""} ${isActive ? styles.progressCircleActive : ""}`}
            >
              {isCompleted ? (
                <Box
                  component="svg"
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                  className={styles.progressCheck}
                >
                  <path d="M2 6.2L4.8 9L10 3.8" />
                </Box>
              ) : (
                <Typography component="span" className={styles.progressNumber}>
                  {step.id}
                </Typography>
              )}
            </Box>
            <Typography
              component="p"
              className={`${styles.progressLabel} ${isCompleted ? styles.progressLabelCompleted : ""} ${isActive ? styles.progressLabelActive : ""}`}
            >
              {step.label}
            </Typography>
          </Box>
          {index < steps.length - 1 && (
            <Box className={styles.progressConnector} aria-hidden="true" />
          )}
        </Box>
      );
    })}
  </Box>
);

export default CvBuilderProgressRail;
