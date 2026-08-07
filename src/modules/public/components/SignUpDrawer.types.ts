export type SignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type GoogleAuthStatus = "idle" | "success" | "error";

export const initialSignUpFormValues: SignUpFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};
