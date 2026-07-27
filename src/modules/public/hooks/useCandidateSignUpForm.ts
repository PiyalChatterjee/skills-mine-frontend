import { useZodForm } from "@/hooks/useZodForm";
import {
  initialCandidateSignUpFormValues,
  type CandidateSignUpFormValues,
} from "@/modules/public/components/CandidateSignUpDrawer.types";
import { candidateSignUpSchema } from "@/app/validation.schema";
import { authApi } from "@/services/api/authApi";

export const useCandidateSignUpForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(candidateSignUpSchema, {
    defaultValues: initialCandidateSignUpFormValues,
  });

  const submitForm = async (): Promise<boolean> => {
    let submitted = false;

    await handleSubmit(async (formValues: CandidateSignUpFormValues) => {
      const response = await authApi.signup(formValues);
      submitted = response.status === 201;
    })();

    return submitted;
  };

  return {
    register,
    control,
    errors,
    isSubmitting,
    submitForm,
  };
};
