import { useZodForm } from "@/hooks/useZodForm";
import { initialSignUpFormValues, type SignUpFormValues } from "@/modules/public/components/SignUpDrawer.types";
import { recruiterSignUpSchema } from "@/app/validation.schema";
import { authApi } from "@/services/api/authApi";

export const useRecruiterSignUpForm = () => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useZodForm(recruiterSignUpSchema, {
    defaultValues: initialSignUpFormValues,
  });

  const submitForm = async (): Promise<boolean> => {
    let submitted = false;

    await handleSubmit(async (formValues: SignUpFormValues) => {
      const response = await authApi.staffRegister({
        ...formValues,
        acceptPrivacyPolicy: formValues.acceptTerms,
      });
      submitted = response.statusCode === 201;
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
