export type CandidateSignUpFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  passwordHint: string;
  termsAccepted: boolean;
};

export type GoogleAuthStatus = "idle" | "success" | "error";

export const initialCandidateSignUpFormValues: CandidateSignUpFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  passwordHint: "",
  termsAccepted: false,
};
