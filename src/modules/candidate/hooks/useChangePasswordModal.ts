import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";
import { INVALID_EMAIL_MESSAGE, isValidEmail } from "@/app/validation.schema";

type UseChangePasswordModalArgs = {
  open: boolean;
  prefillEmail?: string;
  mode?: "reset" | "change";
  onClose: () => void;
};

export const useChangePasswordModal = ({
  open,
  prefillEmail = "",
  mode = "reset",
  onClose,
}: UseChangePasswordModalArgs) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState(prefillEmail);
  const [isSending, setIsSending] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(prefillEmail);
      setIsTouched(false);
    }
  }, [open, prefillEmail]);

  const emailError =
    isTouched && email.trim() && !isValidEmail(email) ? INVALID_EMAIL_MESSAGE : "";

  const handleBlur = () => setIsTouched(true);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    if (!isValidEmail(trimmed)) {
      setIsTouched(true);
      return;
    }

    setIsSending(true);
    try {
      await authApi.forgotPassword({ email: trimmed });
      dispatch(
        pushNotification({
          level: "success",
          title: "Check your email",
          message:
            mode === "change"
              ? "Password change instructions have been sent."
              : "Password reset instructions have been sent.",
        }),
      );
      onClose();
      // The confirmation code is entered on the reset password form; no token is needed in the URL.
      navigate(`${ROUTE_PATHS.resetPassword}?email=${encodeURIComponent(trimmed)}`);
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: mode === "change" ? "Failed to send change instructions" : "Failed to send",
          message: "Please try again later.",
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  return {
    email,
    setEmail,
    emailError,
    handleBlur,
    isSending,
    handleSend,
  };
};
