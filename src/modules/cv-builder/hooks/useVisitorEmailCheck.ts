import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/routes/routePaths";
import { visitorApi } from "@/services/api/visitorApi";

// Guest/visitor-only flow: looks up an email against /visitors/email and, when
// it already belongs to a CANDIDATE, prompts the user to log in instead of
// continuing as a guest.
export const useVisitorEmailCheck = (jobId?: string) => {
  const navigate = useNavigate();
  const [existingCandidateEmail, setExistingCandidateEmail] = useState<string | null>(null);

  const checkEmail = useCallback(async (email: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    try {
      const result = await visitorApi.checkEmail(trimmedEmail);
      if (result.type === "CANDIDATE" && result.is_present) {
        setExistingCandidateEmail(trimmedEmail);
      }
    } catch {
      // Best-effort lookup — a failed check shouldn't block the guest flow.
    }
  }, []);

  const closeModal = useCallback(() => setExistingCandidateEmail(null), []);

  const goToLogin = useCallback(() => {
    setExistingCandidateEmail(null);
    navigate(
      jobId
        ? `${ROUTE_PATHS.login}?job=${encodeURIComponent(jobId)}`
        : ROUTE_PATHS.login,
    );
  }, [jobId, navigate]);

  return {
    isCandidateExistsModalOpen: Boolean(existingCandidateEmail),
    existingCandidateEmail,
    checkEmail,
    closeModal,
    goToLogin,
  };
};
