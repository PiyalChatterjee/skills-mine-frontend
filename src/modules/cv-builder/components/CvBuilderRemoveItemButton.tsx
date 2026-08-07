import { Box, IconButton } from "@mui/material";
import styles from "../pages/CvBuilderPage.module.css";

type CvBuilderRemoveItemButtonProps = {
  canRemove: boolean;
  ariaLabel: string;
  onClick: () => void;
};

const CvBuilderRemoveItemButton = ({
  canRemove,
  ariaLabel,
  onClick,
}: CvBuilderRemoveItemButtonProps) => {
  if (!canRemove) {
    return null;
  }

  return (
    <IconButton
      type="button"
      onClick={onClick}
      className={styles.inlineRemoveButton}
      aria-label={ariaLabel}
      disableRipple
    >
      <Box
        component="span"
        className={styles.removeSkillIcon}
        aria-hidden="true"
      >
        ✕
      </Box>
    </IconButton>
  );
};

export default CvBuilderRemoveItemButton;
