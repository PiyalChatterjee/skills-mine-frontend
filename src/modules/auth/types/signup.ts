import { z } from "zod";
import { localPhoneNumberSchema } from "@/app/phoneNumber";
import { emailSchema } from "@/app/validation.schema";
import { strongPasswordSchema } from "@/app/passwordPolicy";

// Shared by both the self-service (candidate) and invited (staff) signup forms
// so email/phone/password validation — and their messages — stay identical.
const baseSignupShape = {
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: emailSchema,
  mobileNumber: localPhoneNumberSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "You must accept the terms and privacy policy",
  }),
};

const passwordsMatch = (values: { password: string; confirmPassword: string }) =>
  values.password === values.confirmPassword;
const passwordMismatchIssue = {
  path: ["confirmPassword"],
  message: "Passwords do not match",
};

// The same page/schema handles self-service candidate signup (no staff number)
// and invited-staff signup (staff number required) depending on the invite token,
// so staffNumber stays optional here and is enforced at submit time.
export const inviteSignupSchema = z
  .object({ ...baseSignupShape, staffNumber: z.string().trim() })
  .refine(passwordsMatch, passwordMismatchIssue);

export type InviteSignupFormValues = z.infer<typeof inviteSignupSchema>;

// Recruiters are always invited, so their staff number is unconditionally required.
export const recruiterInviteSignupSchema = z
  .object({
    ...baseSignupShape,
    staffNumber: z.string().trim().min(1, "Staff number is required"),
  })
  .refine(passwordsMatch, passwordMismatchIssue);

export type RecruiterInviteSignupFormValues = z.infer<typeof recruiterInviteSignupSchema>;
