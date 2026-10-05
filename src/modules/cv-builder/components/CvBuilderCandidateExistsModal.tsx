import { Button, Dialog, DialogContent, Typography } from "@mui/material";
import styles from "./CvBuilderCandidateExistsModal.module.css";

type CvBuilderCandidateExistsModalProps = {
  open: boolean;
  email?: string | null;
  onClose: () => void;
  onGoToLogin: () => void;
};

const CvBuilderCandidateExistsModal = ({
  open,
  email,
  onClose,
  onGoToLogin,
}: CvBuilderCandidateExistsModalProps) => (
  <Dialog
    open={open}
    onClose={onClose}
    slotProps={{ paper: { className: styles.paper } }}
    aria-labelledby="candidate-exists-title"
    aria-describedby="candidate-exists-desc"
  >
    <DialogContent className={styles.content}>
      <Typography id="candidate-exists-title" className={styles.title}>
        Account already exists
      </Typography>

      <Typography id="candidate-exists-desc" className={styles.description}>
        A candidate already exists with the email address{" "}
        <strong>{email}</strong>. Log in to continue with this application.
      </Typography>

      <div className={styles.buttonsRow}>
        <Button variant="outlined" className={styles.cancelButton} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" className={styles.loginButton} onClick={onGoToLogin}>
          Go to login
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default CvBuilderCandidateExistsModal;
