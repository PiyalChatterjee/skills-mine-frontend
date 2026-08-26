import { useZodForm } from "@/hooks/useZodForm";
import { initialSignUpFormValues, type SignUpFormValues } from "@/modules/public/components/SignUpDrawer.types";
import { candidateSignUpSchema } from "@/app/validation.schema";
import { authApi } from "@/services/api/authApi";
import { PENDING_CANDIDATE_PROFILE_STORAGE_KEY } from "@/modules/candidate/types/profileCreation";
import { useCallback } from "react";

const isSuccessfulRegistration = (response: unknown) => {
  if (!response || typeof response !== "object") {
    return false;
  }

  const payload = response as {
    statusCode?: number;
    userId?: string;
    email?: string;
    data?: { userId?: string; email?: string };
  };

  return (
    payload.statusCode === 201 ||
    Boolean(payload.userId) ||
    Boolean(payload.email) ||
    Boolean(payload.data?.userId) ||
    Boolean(payload.data?.email)
  );
};

export const useCandidateSignUpForm = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useZodForm(candidateSignUpSchema, {
    defaultValues: initialSignUpFormValues,
  });

  const submitForm = async (): Promise<boolean> => {
    let submitted = false;

    await handleSubmit(async (formValues: SignUpFormValues) => {
      const response = await authApi.candidateRegister({
        ...formValues,
        acceptPrivacyPolicy: formValues.acceptTerms,
      });
      submitted = isSuccessfulRegistration(response);
      if (submitted) {
        sessionStorage.setItem(
          PENDING_CANDIDATE_PROFILE_STORAGE_KEY,
          JSON.stringify({
            fullName: `${formValues.firstName} ${formValues.lastName}`.trim(),
            email: formValues.email,
            phoneNumber: formValues.mobileNumber,
          }),
        );
      }
    })();

    return submitted;
  };

  const resetForm = useCallback(() => {
    reset(initialSignUpFormValues);
  }, [reset]);

  return {
    register,
    control,
    errors,
    isSubmitting,
    submitForm,
    resetForm,
  };
};
