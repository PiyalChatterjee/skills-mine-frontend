import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/services/api";
import { ROUTE_PATHS } from "@/routes/routePaths";
import type { AppDispatch } from "@/store";
import { pushNotification } from "@/store/slices/notificationSlice";

type ViewState = "request" | "otp";

type UseChangePasswordModalArgs = {
  open: boolean;
  prefillEmail?: string;
};

const buildMockResetToken = (email: string, otpCode: string) => {
  const payload = `${email}:${otpCode}:${Date.now()}`;
  return `mock-${btoa(payload)}`;
};

export const useChangePasswordModal = ({
  open,
  prefillEmail = "",
}: UseChangePasswordModalArgs) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [email, setEmail] = useState(prefillEmail);
  const [isSending, setIsSending] = useState(false);
  const [view, setView] = useState<ViewState>("request");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (open) {
      setEmail(prefillEmail);
      setView("request");
      setOtp(["", "", "", ""]);
    }
  }, [open, prefillEmail]);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSending(true);
    try {
      await authApi.forgotPassword({ email: trimmed });
      dispatch(
        pushNotification({
          level: "success",
          title: "Check your email",
          message: "Password reset instructions have been sent.",
        }),
      );
      setView("otp");
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: "Failed to send",
          message: "Please try again later.",
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const nextChar = value.replace(/\D+/g, "").slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = nextChar;
      return next;
    });

    if (!nextChar) {
      return;
    }

    if (index < otpInputRefs.current.length - 1) {
      otpInputRefs.current[index + 1]?.focus();
      return;
    }

    submitButtonRef.current?.focus();
  };

  const setOtpInputRef = (index: number, element: HTMLInputElement | null) => {
    otpInputRefs.current[index] = element;
  };

  const handleResend = async () => {
    const trimmed = email.trim();
    if (!trimmed || isSending) {
      return;
    }

    setIsSending(true);
    try {
      await authApi.forgotPassword({ email: trimmed });
      dispatch(
        pushNotification({
          level: "success",
          title: "OTP resent",
          message: "A new OTP has been sent to your email.",
        }),
      );
      setOtp(["", "", "", ""]);
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: "Failed to resend",
          message: "Please try again later.",
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmitOtp = async () => {
    if (isSending || otp.some((digit) => digit.length !== 1)) {
      return;
    }

    const otpCode = otp.join("");
    const trimmedEmail = email.trim().toLowerCase();
    setIsSending(true);
    try {
      // TODO: Call OTP validation endpoint when available (e.g. authApi.validateForgotPasswordOtp)
      // await authApi.validateForgotPasswordOtp({ email: email.trim(), otp: otpCode });
      const mockToken = buildMockResetToken(trimmedEmail, otpCode);
      navigate(`${ROUTE_PATHS.resetPassword}?token=${encodeURIComponent(mockToken)}`);
      
    } catch {
      dispatch(
        pushNotification({
          level: "error",
          title: "Invalid OTP",
          message: "Please check the OTP and try again.",
        }),
      );
    } finally {
      setIsSending(false);
    }
  };

  return {
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
  };
};
