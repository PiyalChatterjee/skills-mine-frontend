import { z } from "zod";
import { localPhoneNumberSchema } from "@/app/phoneNumber";
import { strongPasswordSchema } from "@/app/passwordPolicy";

export const inviteSignupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
    staffNumber: z.string().trim().min(1, "Staff number is required"),
    mobileNumber: localPhoneNumberSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms and privacy policy",
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type InviteSignupFormValues = z.infer<typeof inviteSignupSchema>;
