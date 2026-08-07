export type CandidateSignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export type GoogleAuthStatus = "idle" | "success" | "error";

export const initialCandidateSignUpFormValues: CandidateSignUpFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};
