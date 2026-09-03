import { useZodForm } from "@/hooks/useZodForm";
import { initialSignUpFormValues, type SignUpFormValues } from "@/modules/public/components/SignUpDrawer.types";
import { recruiterSignUpSchema } from "@/app/validation.schema";
import { useCallback } from "react";

export const useRecruiterSignUpForm = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useZodForm(recruiterSignUpSchema, {
    defaultValues: initialSignUpFormValues,
  });

  const submitForm = async (): Promise<boolean> => {
    const submitted = false;

    await handleSubmit(async (formValues: SignUpFormValues) => {
      void formValues;
      throw new Error("Recruiter registration requires an invitation link from an administrator.");
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
