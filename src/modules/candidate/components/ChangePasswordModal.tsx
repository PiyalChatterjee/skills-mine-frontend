import { useChangePasswordModal } from "@/modules/candidate/hooks/useChangePasswordModal";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import closeIconSrc from "@/assets/icons/close-icon.svg";
import styles from "./ChangePasswordModal.module.css";

type ChangePasswordModalProps = {
  open: boolean;
  prefillEmail?: string;
  onClose: () => void;
  mode?: "reset" | "change";
};

const ChangePasswordModal = ({
  open,
  prefillEmail = "",
  onClose,
  mode = "reset",
}: ChangePasswordModalProps) => {
  const { email, setEmail, emailError, handleBlur, isSending, handleSend } = useChangePasswordModal({
    open,
    prefillEmail,
    mode,
    onClose,
  });

  return (
    <Dialog open={open} onClose={onClose} slotProps={{ paper: { className: styles.paper } }}>
      <DialogContent className={styles.content}>
        <Box className={styles.closeRow}>
          <IconButton
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <img src={closeIconSrc} alt="" aria-hidden="true" className={styles.closeIcon} />
          </IconButton>
        </Box>

        <Box className={styles.body}>
          <Typography className={styles.title}>
            {mode === "change" ? "Change your password" : "Reset your password"}
          </Typography>

          <Box className={styles.bodyContent}>
            <Typography className={styles.description}>
              {mode === "change"
                ? "Enter your email address below to receive instructions for changing your password."
                : "Enter your email address below to receive a confirmation code for resetting your password."}
            </Typography>

            <Box className={styles.fieldBlock}>
              <Typography className={styles.fieldLabel}>Email address</Typography>
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                error={Boolean(emailError)}
                helperText={emailError || undefined}
                disabled={isSending}
                className={styles.emailInput}
                slotProps={{ htmlInput: { "aria-label": "Email address" } }}
              />
            </Box>

            <Divider className={styles.divider} />

            <Box className={styles.buttonsRow}>
              <Button
                variant="outlined"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                className={styles.sendButton}
                onClick={handleSend}
                disabled={isSending || !email.trim()}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
