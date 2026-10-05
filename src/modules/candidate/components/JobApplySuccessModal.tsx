import { Button, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import checkIcon from "@/assets/job-details/apply-modal-check.svg";
import closeIcon from "@/assets/job-details/apply-modal-close.svg";
import successBg from "@/assets/job-details/apply-modal-success-bg.svg";
import styles from "./JobApplySuccessModal.module.css";

type JobApplySuccessModalProps = {
  open: boolean;
  onBackToDashboard: () => void;
  onContinueBrowsing: () => void;
};

const JobApplySuccessModal = ({
  open,
  onBackToDashboard,
  onContinueBrowsing,
}: JobApplySuccessModalProps) => (
  <Dialog
    open={open}
    onClose={onContinueBrowsing}
    slotProps={{ paper: { className: styles.paper } }}
    aria-labelledby="job-apply-success-title"
  >
    <DialogContent className={styles.content}>
      <IconButton
        type="button"
        className={styles.closeButton}
        onClick={onContinueBrowsing}
        aria-label="Close application success dialog"
        disableRipple
      >
        <img src={closeIcon} alt="" className={styles.closeIcon} aria-hidden="true" />
      </IconButton>

      <div className={styles.successIconWrap} aria-hidden="true">
        <img src={successBg} alt="" className={styles.successBg} />
        <img src={checkIcon} alt="" className={styles.checkIcon} />
      </div>

      <Typography id="job-apply-success-title" className={styles.title}>
        <span>Congratulations!</span>
        <span>Your Application Has Been Sent.</span>
      </Typography>

      <Button
        variant="contained"
        className={styles.dashboardButton}
        onClick={onBackToDashboard}
      >
        Back to dashboard
      </Button>

      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinueBrowsing}
      >
        Continue browsing
      </button>
    </DialogContent>
  </Dialog>
);

export default JobApplySuccessModal;