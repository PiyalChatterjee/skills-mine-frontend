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
  const {
    email,
    setEmail,
    isSending,
    view,
    otp,
    setOtpInputRef,
    submitButtonRef,
    handleSend,
    handleOtpChange,
    handleResend,
    handleSubmitOtp,
  } = useChangePasswordModal({
    open,
    prefillEmail,
    mode,
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
          {view === "request" ? (
            <>
              <Typography className={styles.title}>
                {mode === "change" ? "Change your password" : "Reset your password"}
              </Typography>

              <Box className={styles.bodyContent}>
                <Typography className={styles.description}>
                  {mode === "change"
                    ? "Enter your email address below to receive instructions for changing your password."
                    : "Enter your email address below to receive instructions for resetting your password."}
                </Typography>

                <Box className={styles.fieldBlock}>
                  <Typography className={styles.fieldLabel}>Email address</Typography>
                  <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSending}
                    className={styles.emailInput}
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
            </>
          ) : (
            <>
              <Typography className={styles.title}>Enter OTP</Typography>

              <Box className={styles.bodyContent}>
                <Typography className={styles.description}>
                  Enter the OTP you received via email to {mode === "change" ? "change" : "reset"} your password.
                </Typography>

                <Box className={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextField
                      key={`otp-${index}`}
                      variant="outlined"
                      value={digit}
                      onChange={(event) => {
                        handleOtpChange(index, event.target.value);
                      }}
                      slotProps={{
                        htmlInput: {
                          ref: (element: HTMLInputElement | null) => {
                            setOtpInputRef(index, element);
                          },
                          maxLength: 1,
                          inputMode: "numeric",
                          "aria-label": `OTP digit ${index + 1}`,
                        },
                      }}
                      disabled={isSending}
                      className={styles.otpInput}
                    />
                  ))}
                </Box>

                <Typography className={styles.resendText}>
                  Haven&apos;t received the OTP?{" "}
                  <button
                    type="button"
                    className={styles.resendButton}
                    onClick={handleResend}
                    disabled={isSending}
                  >
                    Resend
                  </button>
                  .
                </Typography>

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
                    ref={submitButtonRef}
                    onClick={handleSubmitOtp}
                    disabled={isSending || otp.some((digit) => digit.length !== 1)}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordModal;
